import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import redisClient from '../Functions/redis_config.js';

dotenv.config();

const route = Router();
const prisma = new PrismaClient();
const jwtpasskey = process.env.JWT_PASSKEY;

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const DAY = 24 * 60 * 60 * 1000;

// Admins are listed by email (username) in ADMIN_EMAILS, comma separated
const adminEmails = () =>
  (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

// Resolve the signed-in user from the "usertoken: bearer <jwt>" header
const getUserFromRequest = async (req) => {
  const { usertoken } = req.headers;
  if (!usertoken) return null;

  const token = usertoken.split(' ').pop();
  try {
    const decoded = jwt.verify(token, jwtpasskey);
    return await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, username: true, firstname: true },
    });
  } catch {
    return null;
  }
};

const isAdmin = (user) => !!user && adminEmails().includes(user.username.toLowerCase());

const requireAdmin = async (req, res, next) => {
  const user = await getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ success: false, msg: 'Sign in required' });
  }
  if (!isAdmin(user)) {
    return res.status(403).json({ success: false, msg: 'Admin access required' });
  }
  req.admin = user;
  next();
};

// Is the current user an admin? (used by the frontend to show/hide the admin UI)
route.get('/me', async (req, res) => {
  const user = await getUserFromRequest(req);
  res.json({ success: true, signedIn: !!user, isAdmin: isAdmin(user) });
});

route.use(requireAdmin);

const STATS_RANGES = [7, 30, 90];
const STATS_TTL = 5 * 60; // seconds

const clearStatsCache = () => Promise.all(STATS_RANGES.map((d) => redisClient.del(`admin-stats-${d}`)));

const clearProblemCache = async (id) => {
  await redisClient.del('all-problems');
  if (id) await redisClient.del(`problem-${id}`);
  await clearStatsCache();
};

// Validate and normalise a problem payload from the admin form
const parseProblem = (body) => {
  const errors = {};
  const title = String(body.title || '').trim();
  const description = String(body.description || '').trim();
  const difficulty = String(body.difficulty || '');
  const constraints = String(body.constraints || '').trim();
  const inputtype = String(body.inputtype || '').trim();

  const tags = [
    ...new Map(
      (Array.isArray(body.tags) ? body.tags : [])
        .map((t) => String(t).trim())
        .filter(Boolean)
        .map((t) => [t.toLowerCase(), t])
    ).values(),
  ];

  const testCases = (Array.isArray(body.testCases) ? body.testCases : []).map((tc) => ({
    input: String(tc?.input ?? ''),
    output: String(tc?.output ?? ''),
  }));

  if (!title) errors.title = 'Title is required';
  if (!description) errors.description = 'Description is required';
  if (!DIFFICULTIES.includes(difficulty)) errors.difficulty = 'Pick Easy, Medium or Hard';
  if (testCases.length === 0) errors.testCases = 'Add at least one test case';
  else if (testCases.some((tc) => !tc.output.trim())) errors.testCases = 'Every test case needs an expected output';

  return { errors, data: { title, description, difficulty, constraints, inputtype }, tags, testCases };
};

// Find tags by name (case-insensitive) or create the ones that don't exist yet
const resolveTagIds = async (tx, names) => {
  const ids = [];
  for (const name of names) {
    const existing = await tx.problem_Tags.findFirst({
      where: { tagName: { equals: name, mode: 'insensitive' } },
    });
    const tag = existing || (await tx.problem_Tags.create({ data: { tagName: name } }));
    ids.push(tag.id);
  }
  return ids;
};

// ───────────────────────── Tags ─────────────────────────

route.get('/tags', async (req, res) => {
  try {
    const tags = await prisma.problem_Tags.findMany({
      select: { id: true, tagName: true, _count: { select: { problems: true } } },
      orderBy: { tagName: 'asc' },
    });
    res.json({ success: true, tags: tags.map((t) => ({ id: t.id, name: t.tagName, problems: t._count.problems })) });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Error fetching tags', error: error.message });
  }
});

const findTagByName = (name, exceptId) =>
  prisma.problem_Tags.findFirst({
    where: { tagName: { equals: name, mode: 'insensitive' }, ...(exceptId ? { NOT: { id: exceptId } } : {}) },
  });

// Problems that show this tag are cached with it, so refresh their cache entries
const clearTagCache = async (tagId) => {
  const links = await prisma.problemToTags.findMany({ where: { tid: tagId }, select: { pid: true } });
  await redisClient.del('all-problems');
  await Promise.all(links.map((l) => redisClient.del(`problem-${l.pid}`)));
  await clearStatsCache();
};

route.post('/tags', async (req, res) => {
  const name = String(req.body.name || '').trim();
  if (!name) return res.status(400).json({ success: false, msg: 'Tag name is required' });
  if (name.length > 40) return res.status(400).json({ success: false, msg: 'Keep tag names under 40 characters' });

  try {
    const existing = await findTagByName(name);
    if (existing) return res.status(409).json({ success: false, msg: `"${existing.tagName}" already exists` });

    const tag = await prisma.problem_Tags.create({ data: { tagName: name } });
    await clearStatsCache();
    res.status(201).json({ success: true, tag: { id: tag.id, name: tag.tagName, problems: 0 } });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Error creating tag', error: error.message });
  }
});

route.patch('/tags/:id', async (req, res) => {
  const { id } = req.params;
  const name = String(req.body.name || '').trim();
  if (!name) return res.status(400).json({ success: false, msg: 'Tag name is required' });
  if (name.length > 40) return res.status(400).json({ success: false, msg: 'Keep tag names under 40 characters' });

  try {
    const tag = await prisma.problem_Tags.findUnique({ where: { id } });
    if (!tag) return res.status(404).json({ success: false, msg: 'Tag not found' });

    const clash = await findTagByName(name, id);
    if (clash) return res.status(409).json({ success: false, msg: `"${clash.tagName}" already exists` });

    await prisma.problem_Tags.update({ where: { id }, data: { tagName: name } });
    await clearTagCache(id);
    res.json({ success: true, tag: { id, name } });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Error renaming tag', error: error.message });
  }
});

// Only unused tags can be deleted, so no problem silently loses a topic
route.delete('/tags/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const tag = await prisma.problem_Tags.findUnique({
      where: { id },
      select: { id: true, _count: { select: { problems: true } } },
    });
    if (!tag) return res.status(404).json({ success: false, msg: 'Tag not found' });
    if (tag._count.problems > 0) {
      return res.status(409).json({ success: false, msg: `Remove it from ${tag._count.problems} problem(s) first` });
    }

    await prisma.problem_Tags.delete({ where: { id } });
    await clearStatsCache();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Error deleting tag', error: error.message });
  }
});

// ───────────────────────── Problems ─────────────────────────

route.get('/problems', async (req, res) => {
  try {
    const problems = await prisma.problem.findMany({
      include: {
        tags: { include: { tag: true } },
        _count: { select: { testCases: true, solves: true } },
      },
      orderBy: { title: 'asc' },
    });

    const solvers = await prisma.solve.groupBy({ by: ['problemId', 'userId'] });
    const solverCount = solvers.reduce((m, s) => m.set(s.problemId, (m.get(s.problemId) || 0) + 1), new Map());

    res.json({
      success: true,
      problems: problems.map((p) => ({
        id: p.id,
        title: p.title,
        difficulty: p.difficulty,
        tags: p.tags.map((t) => t.tag.tagName),
        testCases: p._count.testCases,
        submissions: p._count.solves,
        solvers: solverCount.get(p.id) || 0,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Error fetching problems', error: error.message });
  }
});

route.get('/problems/:id', async (req, res) => {
  try {
    const problem = await prisma.problem.findUnique({
      where: { id: req.params.id },
      include: {
        tags: { include: { tag: true } },
        testCases: { orderBy: { id: 'asc' } },
      },
    });
    if (!problem) return res.status(404).json({ success: false, msg: 'Problem not found' });

    res.json({
      success: true,
      problem: {
        id: problem.id,
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty,
        constraints: problem.constraints,
        inputtype: problem.inputtype,
        tags: problem.tags.map((t) => t.tag.tagName),
        testCases: problem.testCases.map(({ input, output }) => ({ input, output })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Error fetching problem', error: error.message });
  }
});

route.post('/problems', async (req, res) => {
  const { errors, data, tags, testCases } = parseProblem(req.body);
  if (Object.keys(errors).length) {
    return res.status(400).json({ success: false, msg: 'Please fix the highlighted fields', errors });
  }

  try {
    const problem = await prisma.$transaction(async (tx) => {
      const created = await tx.problem.create({ data });
      const tagIds = await resolveTagIds(tx, tags);
      if (tagIds.length) {
        await tx.problemToTags.createMany({ data: tagIds.map((tid) => ({ pid: created.id, tid })) });
      }
      await tx.testCase.createMany({ data: testCases.map((tc) => ({ ...tc, problemId: created.id })) });
      return created;
    });

    await clearProblemCache(problem.id);
    res.status(201).json({ success: true, msg: 'Problem created', problem: { id: problem.id } });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Error creating problem', error: error.message });
  }
});

route.put('/problems/:id', async (req, res) => {
  const { id } = req.params;
  const { errors, data, tags, testCases } = parseProblem(req.body);
  if (Object.keys(errors).length) {
    return res.status(400).json({ success: false, msg: 'Please fix the highlighted fields', errors });
  }

  try {
    const exists = await prisma.problem.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return res.status(404).json({ success: false, msg: 'Problem not found' });

    // Tags and test cases are replaced as a whole, inside one transaction
    await prisma.$transaction(async (tx) => {
      await tx.problem.update({ where: { id }, data });
      await tx.problemToTags.deleteMany({ where: { pid: id } });
      const tagIds = await resolveTagIds(tx, tags);
      if (tagIds.length) {
        await tx.problemToTags.createMany({ data: tagIds.map((tid) => ({ pid: id, tid })) });
      }
      await tx.testCase.deleteMany({ where: { problemId: id } });
      await tx.testCase.createMany({ data: testCases.map((tc) => ({ ...tc, problemId: id })) });
    });

    await clearProblemCache(id);
    res.json({ success: true, msg: 'Problem updated', problem: { id } });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Error updating problem', error: error.message });
  }
});

// ───────────────────────── Analytics ─────────────────────────

const dayKey = (d) => new Date(d).toISOString().slice(0, 10);

// Analytics are only computed when an admin asks for them, and cached in Redis
// for a few minutes so repeated loads don't re-run the queries.
route.get('/stats', async (req, res) => {
  const days = STATS_RANGES.includes(Number(req.query.days)) ? Number(req.query.days) : 30;
  const cacheKey = `admin-stats-${days}`;

  if (req.query.fresh !== '1') {
    const cached = await redisClient.get(cacheKey);
    if (cached) return res.json({ ...JSON.parse(cached), cached: true });
  }
  const now = Date.now();
  const since = new Date(now - days * DAY);
  since.setUTCHours(0, 0, 0, 0);
  const prevSince = new Date(since.getTime() - days * DAY);

  try {
    const [
      users, problemCount, testCaseCount, tagCount, totalSubmissions,
      inRange, prevCount, problems, recent,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.problem.count(),
      prisma.testCase.count(),
      prisma.problem_Tags.count(),
      prisma.solve.count(),
      prisma.solve.findMany({
        where: { date: { gte: since } },
        select: { date: true, language: true, userId: true, problemId: true },
      }),
      prisma.solve.count({ where: { date: { gte: prevSince, lt: since } } }),
      prisma.problem.findMany({
        select: { id: true, title: true, difficulty: true, _count: { select: { testCases: true, solves: true } } },
      }),
      prisma.solve.findMany({
        orderBy: { date: 'desc' },
        take: 8,
        select: {
          date: true,
          language: true,
          problem: { select: { id: true, title: true } },
          user: { select: { firstname: true, lastname: true } },
        },
      }),
    ]);

    // Daily accepted submissions, with zero-filled gaps
    const perDay = new Map();
    for (let t = since.getTime(); t <= now; t += DAY) perDay.set(dayKey(t), 0);
    inRange.forEach((s) => perDay.set(dayKey(s.date), (perDay.get(dayKey(s.date)) || 0) + 1));

    const languages = {};
    inRange.forEach((s) => (languages[s.language] = (languages[s.language] || 0) + 1));

    const activeUsers = new Set(inRange.map((s) => s.userId)).size;

    // Distinct solvers per problem in range
    const solversByProblem = new Map();
    inRange.forEach((s) => {
      if (!solversByProblem.has(s.problemId)) solversByProblem.set(s.problemId, new Set());
      solversByProblem.get(s.problemId).add(s.userId);
    });
    const titles = new Map(problems.map((p) => [p.id, p]));
    const topProblems = [...solversByProblem.entries()]
      .map(([id, set]) => ({ id, title: titles.get(id)?.title, difficulty: titles.get(id)?.difficulty, solvers: set.size }))
      .filter((p) => p.title)
      .sort((a, b) => b.solvers - a.solvers)
      .slice(0, 5);

    // All-time leaderboard by distinct problems solved
    const pairs = await prisma.solve.groupBy({ by: ['userId', 'problemId'] });
    const solvedByUser = pairs.reduce((m, p) => m.set(p.userId, (m.get(p.userId) || 0) + 1), new Map());
    const leaderIds = [...solvedByUser.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const leaderUsers = await prisma.user.findMany({
      where: { id: { in: leaderIds.map(([id]) => id) } },
      select: { id: true, firstname: true, lastname: true },
    });
    const leaderboard = leaderIds.map(([id, solved]) => {
      const u = leaderUsers.find((x) => x.id === id);
      return { name: [u?.firstname, u?.lastname].filter(Boolean).join(' ') || 'Unknown', solved };
    });

    const difficulty = DIFFICULTIES.map((level) => ({
      level,
      problems: problems.filter((p) => p.difficulty === level).length,
    }));

    // Content that needs an admin's attention
    const attention = [
      ...problems.filter((p) => p._count.testCases < 3).map((p) => ({
        id: p.id, title: p.title, issue: `Only ${p._count.testCases} test case${p._count.testCases === 1 ? '' : 's'}`,
      })),
      ...problems.filter((p) => p._count.solves === 0).map((p) => ({
        id: p.id, title: p.title, issue: 'Never solved',
      })),
    ].slice(0, 6);

    const payload = {
      success: true,
      days,
      generatedAt: new Date().toISOString(),
      totals: { users, problems: problemCount, testCases: testCaseCount, tags: tagCount, submissions: totalSubmissions },
      range: {
        submissions: inRange.length,
        previousSubmissions: prevCount,
        activeUsers,
        perDay: [...perDay.entries()].map(([date, count]) => ({ date, count })),
        languages: Object.entries(languages).map(([language, count]) => ({ language, count })).sort((a, b) => b.count - a.count),
        topProblems,
      },
      difficulty,
      leaderboard,
      attention,
      recent: recent.map((r) => ({
        date: r.date,
        language: r.language,
        problem: r.problem,
        user: [r.user?.firstname, r.user?.lastname].filter(Boolean).join(' '),
      })),
    };

    if (await redisClient.set(cacheKey, JSON.stringify(payload))) {
      await redisClient.expire(cacheKey, STATS_TTL);
    }
    res.json({ ...payload, cached: false });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Error building analytics', error: error.message });
  }
});

export default route;
