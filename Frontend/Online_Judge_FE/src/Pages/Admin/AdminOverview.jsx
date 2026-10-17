import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, BarChart3, ChevronRight, Minus, RefreshCw, Trophy } from "lucide-react";
import { DifficultyBadge, Segmented, Skeleton, Spinner } from "../../Components/ui";
import { DailyColumns, DailyTable, HBars } from "../../Components/Admin/charts";
import { adminApi, apiError, getCachedStats, saveStats } from "../../Helping Functions/admin";

const RANGES = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
];
const LANGUAGE_LABEL = { cpp: "C++", python: "Python", javascript: "JavaScript", java: "Java" };
const nf = new Intl.NumberFormat();

const Card = ({ title, subtitle, action, children, className = "" }) => (
  <section className={`card p-5 sm:p-6 ${className}`}>
    <div className="mb-5 flex items-start justify-between gap-3">
      <div>
        <h2 className="title text-base">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[0.8125rem] text-label-3">{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
);

const Delta = ({ current, previous, days }) => {
  if (!previous) {
    return <p className="mt-1 text-xs text-label-3">No data for previous {days} days</p>;
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  const Icon = pct > 0 ? ArrowUpRight : pct < 0 ? ArrowDownRight : Minus;
  const tone = pct > 0 ? "text-success" : pct < 0 ? "text-danger" : "text-label-2";
  return (
    <p className={`mt-1 flex items-center gap-0.5 text-xs font-medium ${tone}`}>
      <Icon size={14} aria-hidden="true" />
      {pct > 0 ? "+" : ""}{pct}% <span className="ml-1 font-normal text-label-3">vs previous {days} days</span>
    </p>
  );
};

const Stat = ({ label, value, children }) => (
  <div className="card p-5">
    <p className="text-[0.8125rem] font-medium text-label-2">{label}</p>
    <p className="display mt-1.5 text-[2rem]">{nf.format(value)}</p>
    {children}
  </div>
);

const relTime = (d) => {
  const s = Math.max(0, Math.round((Date.now() - new Date(d)) / 1000));
  if (!Number.isFinite(s)) return "unknown";
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  if (s < 60) return rtf.format(-s, "second");
  if (s < 3600) return rtf.format(-Math.round(s / 60), "minute");
  if (s < 86400) return rtf.format(-Math.round(s / 3600), "hour");
  return rtf.format(-Math.round(s / 86400), "day");
};

const AdminOverview = () => {
  const [days, setDays] = useState(30);
  // Analytics never load on their own: they come from this session's cache or an explicit request
  const [stats, setStats] = useState(() => getCachedStats(30));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("chart");

  const load = async (fresh = false) => {
    setLoading(true);
    setError("");
    try {
      const r = await adminApi().get("/stats", { params: { days, ...(fresh ? { fresh: 1 } : {}) } });
      saveStats(days, r.data);
      setStats(r.data);
    } catch (e) {
      setError(apiError(e, "Couldn't load analytics"));
    } finally {
      setLoading(false);
    }
  };

  const changeRange = (d) => {
    setDays(d);
    setError("");
    setStats(getCachedStats(d));
  };

  const rangeRow = (
    <Segmented label="Date range" value={days} onChange={changeRange} options={RANGES} />
  );

  if (!stats && loading) {
    return (
      <div className="space-y-6" aria-busy="true">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-[1.25rem]" />)}
        </div>
        <Skeleton className="h-72 rounded-[1.25rem]" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="card flex flex-col items-center gap-2 px-6 py-16 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/12 text-accent">
          <BarChart3 size={22} />
        </span>
        <p className="title mt-2 text-lg">Analytics load on demand</p>
        <p className="max-w-md text-[0.9375rem] text-label-2">
          Choose a range and load it when you need it. Results are kept for this session, so switching pages won't re-run the queries.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {rangeRow}
          <button className="btn btn-primary" onClick={() => load()}>
            <BarChart3 size={15} /> Load analytics
          </button>
        </div>
        {error && (
          <p role="alert" className="mt-3 text-sm text-danger">{error}</p>
        )}
      </div>
    );
  }

  const { totals, range, difficulty, leaderboard, attention, recent } = stats;

  return (
    <div className="space-y-6">
      {/* Filter row: the range scopes every time-based number below */}
      <div className="flex flex-wrap items-center gap-3">
        {rangeRow}
        <p className="text-[0.8125rem] text-label-3">
          Last {days} days for time-based figures; totals are all-time.
        </p>
        <div className="flex items-center gap-2 sm:ml-auto">
          <span className="text-[0.8125rem] text-label-3" role="status">
            {error ? <span className="text-danger">{error}</span> : <>Updated {relTime(stats.generatedAt)}</>}
          </span>
          <button className="btn btn-secondary btn-sm" onClick={() => load(true)} disabled={loading}>
            {loading ? <Spinner className="h-3.5 w-3.5" /> : <RefreshCw size={14} />} Refresh
          </button>
        </div>
      </div>

      <div className={`space-y-6 transition-opacity duration-200 ${loading ? "opacity-50" : ""}`} aria-busy={loading}>
        {/* KPI row */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat label="Accepted submissions" value={range.submissions}>
            <Delta current={range.submissions} previous={range.previousSubmissions} days={days} />
          </Stat>
          <Stat label="Active solvers" value={range.activeUsers}>
            <p className="mt-1 text-xs text-label-3">Users with an accepted submission</p>
          </Stat>
          <Stat label="Registered users" value={totals.users}>
            <p className="mt-1 text-xs text-label-3">All time</p>
          </Stat>
          <Stat label="Problems" value={totals.problems}>
            <p className="mt-1 text-xs text-label-3">
              {nf.format(totals.testCases)} test cases · {nf.format(totals.tags)} tags
            </p>
          </Stat>
        </div>

        <Card
          title="Accepted submissions per day"
          subtitle={`${nf.format(range.submissions)} in the last ${days} days`}
          action={
            <Segmented
              size="sm"
              label="Display as"
              value={view}
              onChange={setView}
              options={[{ value: "chart", label: "Chart" }, { value: "table", label: "Table" }]}
            />
          }
        >
          {view === "chart" ? <DailyColumns data={range.perDay} /> : <DailyTable data={range.perDay} />}
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card title="Languages" subtitle={`Accepted submissions, last ${days} days`}>
            <HBars
              empty="No submissions in this range"
              rows={range.languages.map((l) => ({
                key: l.language,
                label: LANGUAGE_LABEL[l.language] || l.language,
                value: l.count,
                display: `${nf.format(l.count)} · ${Math.round((l.count / range.submissions) * 100)}%`,
              }))}
            />
          </Card>

          <Card title="Problem set" subtitle="Problems by difficulty">
            <HBars
              rows={difficulty.map((d) => ({ key: d.level, label: d.level, value: d.problems }))}
            />
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card title="Most solved" subtitle={`Distinct solvers, last ${days} days`}>
            {range.topProblems.length === 0 ? (
              <p className="py-6 text-center text-sm text-label-3">No problems solved in this range</p>
            ) : (
              <ol className="-mx-2">
                {range.topProblems.map((p, i) => (
                  <li key={p.id}>
                    <Link to={`/admin/problems/${p.id}`} className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-fill active:bg-fill-2">
                      <span className="w-5 text-center text-sm tabular-nums text-label-3">{i + 1}</span>
                      <span className="min-w-0 flex-1 truncate text-[0.9375rem]">{p.title}</span>
                      <DifficultyBadge level={p.difficulty} />
                      <span className="w-16 text-right text-sm tabular-nums text-label-2">{p.solvers} {p.solvers === 1 ? "user" : "users"}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          <Card title="Leaderboard" subtitle="Distinct problems solved, all time">
            {leaderboard.length === 0 ? (
              <p className="py-6 text-center text-sm text-label-3">Nobody has solved a problem yet</p>
            ) : (
              <ol className="-mx-2">
                {leaderboard.map((u, i) => (
                  <li key={i} className="flex items-center gap-3 px-2 py-2.5">
                    <span className="w-5 text-center text-sm tabular-nums text-label-3">
                      {i === 0 ? <Trophy size={15} className="inline text-hint" aria-label="First place" /> : i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[0.9375rem]">{u.name}</span>
                    <span className="text-sm tabular-nums text-label-2">{u.solved} solved</span>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card title="Needs attention" subtitle="Problems with few test cases or no solves">
            {attention.length === 0 ? (
              <p className="py-6 text-center text-sm text-label-3">Everything looks healthy</p>
            ) : (
              <ul className="-mx-2">
                {attention.map((a, i) => (
                  <li key={`${a.id}-${i}`}>
                    <Link to={`/admin/problems/${a.id}`} className="group flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-fill active:bg-fill-2">
                      <AlertTriangle size={16} className="shrink-0 text-warning" aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate text-[0.9375rem]">{a.title}</span>
                      <span className="text-[0.8125rem] text-label-2">{a.issue}</span>
                      <ChevronRight size={16} className="text-label-3" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Recent submissions" subtitle="Latest accepted solutions">
            {recent.length === 0 ? (
              <p className="py-6 text-center text-sm text-label-3">No submissions yet</p>
            ) : (
              <ul className="divide-y divide-hairline">
                {recent.map((r, i) => (
                  <li key={i} className="flex items-center gap-3 py-2.5 text-[0.9375rem]">
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{r.problem?.title}</p>
                      <p className="truncate text-[0.8125rem] text-label-3">
                        {r.user || "Unknown"} · {LANGUAGE_LABEL[r.language] || r.language}
                      </p>
                    </div>
                    <span className="shrink-0 text-[0.8125rem] text-label-3">{relTime(r.date)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
