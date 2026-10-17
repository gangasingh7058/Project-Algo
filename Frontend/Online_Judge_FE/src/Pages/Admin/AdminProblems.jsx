import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ChevronRight, Plus, RefreshCw, Search } from "lucide-react";
import { DifficultyBadge, Segmented, Skeleton, Tag } from "../../Components/ui";
import { adminApi, apiError } from "../../Helping Functions/admin";

const FILTERS = ["All", "Easy", "Medium", "Hard"].map((v) => ({ value: v, label: v }));

const AdminProblems = () => {
  const [problems, setProblems] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("All");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    adminApi()
      .get("/problems")
      .then((r) => { setProblems(r.data.problems); setError(""); })
      .catch((e) => setError(apiError(e, "Couldn't load problems")));
  }, [reloadKey]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (problems || []).filter(
      (p) =>
        (level === "All" || p.difficulty === level) &&
        (!q || p.title.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }, [problems, query, level]);

  if (error && !problems) {
    return (
      <div className="card flex flex-col items-center gap-2 px-6 py-16 text-center">
        <p className="title text-lg">Couldn't load problems</p>
        <p className="text-sm text-label-2">{error}</p>
        <button className="btn btn-secondary btn-sm mt-3" onClick={() => setReloadKey((k) => k + 1)}>
          <RefreshCw size={14} /> Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:w-80">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-label-3" />
          <label htmlFor="problem-search" className="sr-only">Search problems</label>
          <input
            id="problem-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or tag"
            className="field h-9 pl-9 text-[0.9375rem]"
          />
        </div>
        <Segmented label="Filter by difficulty" value={level} onChange={setLevel} options={FILTERS} />
        {problems && (
          <p className="text-[0.8125rem] text-label-3 sm:ml-auto">
            {shown.length} of {problems.length}
          </p>
        )}
      </div>

      <section className="card overflow-hidden">
        {/* column headings (desktop) */}
        <div className="hidden grid-cols-[minmax(0,1fr)_6rem_6rem_6rem_1.25rem] gap-4 border-b border-hairline px-6 py-3 text-xs font-medium text-label-3 md:grid">
          <span>Problem</span>
          <span className="text-right">Test cases</span>
          <span className="text-right">Solvers</span>
          <span className="text-right">Submissions</span>
          <span />
        </div>

        {!problems ? (
          <div className="divide-y divide-hairline">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-3 w-1/4" /></div>
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : shown.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <p className="font-medium">{problems.length ? "No problems match" : "No problems yet"}</p>
            {problems.length === 0 && (
              <Link to="/admin/problems/new" className="btn btn-primary btn-sm mt-2"><Plus size={14} /> Create the first one</Link>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-hairline">
            {shown.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/admin/problems/${p.id}`}
                  className="group grid grid-cols-[minmax(0,1fr)_1.25rem] items-center gap-4 px-5 py-4 transition-colors hover:bg-fill focus-visible:bg-fill focus-visible:outline-none active:bg-fill-2 sm:px-6 md:grid-cols-[minmax(0,1fr)_6rem_6rem_6rem_1.25rem]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <h3 className="truncate text-[1.0625rem] font-medium tracking-[-0.012em]">{p.title}</h3>
                      <DifficultyBadge level={p.difficulty} />
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {p.tags.map((t) => <Tag key={t}>{t}</Tag>)}
                      {/* compact stats on small screens */}
                      <span className="text-xs text-label-3 md:hidden">
                        {p.testCases} tests · {p.solvers} solvers
                      </span>
                    </div>
                  </div>
                  <span className={`hidden items-center justify-end gap-1.5 text-sm tabular-nums md:flex ${p.testCases < 3 ? "text-warning" : "text-label-2"}`}>
                    {p.testCases < 3 && <AlertTriangle size={14} aria-label="Few test cases" />}
                    {p.testCases}
                  </span>
                  <span className="hidden text-right text-sm tabular-nums text-label-2 md:block">{p.solvers}</span>
                  <span className="hidden text-right text-sm tabular-nums text-label-2 md:block">{p.submissions}</span>
                  <ChevronRight size={18} className="text-label-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AdminProblems;
