import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import getTestCases from '../Functions/get_testcases.js';
import redisClient from '../Functions/redis_config.js';

const route = Router();
const prisma = new PrismaClient();

// Get all problems
route.get('/problems', async (req, res) => {
  try {


    // first check in redis

    const cachedProblems = await redisClient.get('all-problems');

    if (cachedProblems) {
      console.log('fetched from redis');
      return res.json({
        success: true,
        problems: JSON.parse(cachedProblems)
      });
    }

    // not in redis
    // fetch from db
    const problems = await prisma.problem.findMany({
      include: {
        tags: {
          include: {
            tag: true, // this includes tagName
          },
        },
      },
    });


    // save to redis

    const savetoredis = await redisClient.set("all-problems", JSON.stringify(problems));
    if (savetoredis) {
      await redisClient.expire("all-problems", 60 * 60);
      console.log('saved to redis');
    }

    return res.json({
      success: true,
      problems: problems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get a single problem by ID
route.get('/problem/:id', async (req, res) => {
  const { id } = req.params;

  try {


    // first check in redis
    const cachedProblem = await redisClient.get(`problem-${id}`);

    if (cachedProblem) {
      return res.json({
        success: true,
        problem: JSON.parse(cachedProblem)
      });
    }

    const problem = await prisma.problem.findUnique({
      where: { id: id },
      include: {
        testCases: {
          orderBy: {
            id: 'asc'
          },
          take: 2
        },
        comments: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // save to redis 

    const savetoredis = await redisClient.set(`problem-${id}`, JSON.stringify(problem));
    if (savetoredis) {
      await redisClient.expire(`problem-${id}`, 60 * 60);
      console.log('saved to redis');
    }

    res.json({
      success: true,
      problem: problem
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// Create a problem (only for admins)
route.post('/problems', async (req, res) => {
  const { title, description, difficulty, constraint = "", inputtype = "" } = req.body;

  if (!title || !description || !difficulty) {
    return res.json({
      success: false,
      message: "Send both Title and Description"
    });
  }

  try {
    const createdProblem = await prisma.problem.create({
      data: {
        title: title,
        description: description,
        difficulty: difficulty,
        constraints: constraint,
        inputtype: inputtype
      }
    });

    res.json({
      success: true,
      message: "Problem created successfully",
      problem: createdProblem
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating problem",
      error: error.message
    });
  }
});




// Comments

// Create Comment
route.post('/comments', async (req, res) => {
  const { title, body, problemId, userId } = req.body;

  if (!title || !body || !problemId || !userId) {
    return res.status(400).json({
      success: false,
      message: "Please provide title, body, problemId, and userId"
    });
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        title,
        body,
        problemId,
        userId
      }
    });

    res.json({
      success: true,
      message: "Comment created successfully",
      comment
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating comment",
      error: error.message
    });
  }
});


// get comments
route.get('/comments/problem/:problemId', async (req, res) => {
  const { problemId } = req.params;

  try {

    // check redis first
    const cachedComments = await redisClient.get(`comments-${problemId}`);
    if (cachedComments) {
      return res.json({
        success: true,
        comments: JSON.parse(cachedComments)
      });
    }

    const comments = await prisma.comment.findMany({
      where: { problemId },
      include: { user: true }
    });

    // save to redis
    const savetoredis = await redisClient.set(`comments-${problemId}`, JSON.stringify(comments));
    if (savetoredis) {
      await redisClient.expire(`comments-${problemId}`, 60 * 60);
      console.log('saved to redis');
    }

    return res.json({
      success: true,
      comments
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// create Test Cases
route.post('/testcases/:pid', async (req, res) => {
  const { pid } = req.params;
  const { testcases } = req.body;

  // Validate inputs
  if (!pid || !Array.isArray(testcases) || testcases.length === 0) {
    return res.json({
      success: false,
      msg: "Send a valid pid and an array of testcases"
    });
  }

  // Check each testcase has input and output
  const invalidCase = testcases.find(tc => !tc.input || !tc.output);
  if (invalidCase) {
    return res.json({
      success: false,
      msg: "Each testcase must have 'input' and 'output'"
    });
  }

  try {
    // Check if pid exists
    const check_pid = await prisma.problem.findFirst({
      where: { id: pid }
    });

    if (!check_pid) {
      return res.json({
        success: false,
        msg: "P_id does not exist or is invalid"
      });
    }

    // Map testcases to include problemId
    const dataToInsert = testcases.map(tc => ({
      input: tc.input,
      output: tc.output,
      problemId: pid
    }));

    // Insert testcases in bulk
    const created = await prisma.testCase.createMany({
      data: dataToInsert
    });

    return res.json({
      success: true,
      msg: "Test cases added successfully",
      count: created.count
    });

  } catch (error) {
    // console.error(error);
    return res.json({
      success: false,
      msg: "Error creating test cases",
      error: error.message
    });
  }
});

route.get('/testcases/:pid', async (req, res) => {

  const { pid } = req.params

  if (!pid) {
    return res.json({
      success: false,
      msg: "Send Problem Id"
    })
  }

  try {
    const result = await getTestCases(pid);
    return res.json(result);
  } catch (error) {
    return res.json({
      success: false,
      msg: "Error Creating Test Cases"
    })
  }


})


export default route;
