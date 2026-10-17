import { CheckCircle2, ChevronRight, Circle, SearchX } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { DifficultyBadge, Skeleton, Tag } from "./ui";
import { spring } from "../Helping Functions/motion";

const tagName = (t) => (t.tag ? t.tag.tagName : t.tagName);
const tagKey = (t) => (t.tag ? t.tag.id : t.tagId);

const ProblemsPanel = ({ problems = [], state = "ready", problemssolved = [] }) => {
  // Convert solved list to Set of pids for quick lookup
  const solvedSet = new Set((problemssolved || []).map((p) => p?.problemId));

  return (
    <section className="card overflow-hidden" aria-labelledby="problems-heading">
      <div className="flex items-center justify-between px-5 py-4 sm:px-6">
        <h2 id="problems-heading" className="title text-lg">Problems</h2>
        {state === "ready" && (
          <span className="text-[0.8125rem] text-label-3 tabular-nums">
            {problems.length} {problems.length === 1 ? "problem" : "problems"}
          </span>
        )}
      </div>

      {state === "loading" && (
        <ul className="divide-y divide-hairline border-t border-hairline">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-center gap-4 px-5 py-4 sm:px-6">
              <Skeleton className="h-5 w-5 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </li>
          ))}
        </ul>
      )}

      {state === "error" && (
        <div className="flex flex-col items-center gap-2 border-t border-hairline px-6 py-16 text-center">
          <SearchX className="text-label-3" size={28} />
          <p className="font-medium">Couldn't load problems</p>
          <p className="text-sm text-label-2">Check your connection and refresh the page.</p>
        </div>
      )}

      {state === "ready" && (
        <ul className="divide-y divide-hairline border-t border-hairline">
          {problems.map((problem, i) => {
            const isSolved = solvedSet.has(problem.id);
            return (
              <motion.li
                key={problem.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: Math.min(i, 10) * 0.03 }}
              >
                <Link
                  to={`/home/problem/${problem.id}`}
                  className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-fill focus-visible:bg-fill focus-visible:outline-none active:bg-fill-2 sm:px-6"
                >
                  {isSolved ? (
                    <CheckCircle2 className="shrink-0 text-success" size={20} aria-label="Solved" />
                  ) : (
                    <Circle className="shrink-0 text-label-3" size={20} aria-label="Not solved" />
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[1.0625rem] font-medium tracking-[-0.012em]">{problem.title}</h3>
                    {(problem.tags || []).length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {problem.tags.map((t) => (
                          <Tag key={tagKey(t)}>{tagName(t)}</Tag>
                        ))}
                      </div>
                    )}
                  </div>

                  <DifficultyBadge level={problem.difficulty} />
                  <ChevronRight
                    size={18}
                    className="shrink-0 text-label-3 transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </Link>
              </motion.li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default ProblemsPanel;
