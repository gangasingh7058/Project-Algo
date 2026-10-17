import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "./ui";
import { spring } from "../Helping Functions/motion";

const LEVELS = [
  { key: "Easy", color: "bg-success" },
  { key: "Medium", color: "bg-warning" },
  { key: "Hard", color: "bg-danger" },
];

const Bar = ({ value, color }) => (
  <div className="h-1.5 w-full overflow-hidden rounded-full bg-fill-2">
    <motion.div
      className={`h-full w-full origin-left rounded-full ${color}`}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: Math.min(1, value) }}
      transition={{ ...spring, duration: 0.8 }}
    />
  </div>
);

const UserStatsPanel = ({ signedIn, loading, firstname, lastname, solved = [], problems = [] }) => {
  const navigate = useNavigate();

  if (!signedIn) {
    return (
      <section className="card p-6">
        <h2 className="title text-lg">Track your progress</h2>
        <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-label-2">
          Sign in to save submissions and see how many problems you've solved.
        </p>
        <div className="mt-5 flex gap-2">
          <button className="btn btn-primary flex-1" onClick={() => navigate("/user/signin")}>Sign in</button>
          <button className="btn btn-secondary flex-1" onClick={() => navigate("/user/register")}>Create account</button>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="card space-y-5 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
        <Skeleton className="h-20 w-full rounded-2xl" />
      </section>
    );
  }

  const solvedIds = new Set(solved.map((s) => s?.problemId));
  const total = problems.length;
  const count = solved.length;
  const initials = `${firstname?.[0] || ""}${lastname?.[0] || ""}`.toUpperCase() || "?";

  return (
    <section className="card p-6" aria-label="Your progress">
      <div className="flex items-center gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent to-ai text-lg font-semibold text-white">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="title truncate text-lg">{[firstname, lastname].filter(Boolean).join(" ")}</p>
          <p className="text-[0.8125rem] text-label-3">Member</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-fill p-4">
        <div className="flex items-baseline justify-between">
          <p className="text-[0.8125rem] font-medium text-label-2">Solved</p>
          <p className="text-[0.8125rem] text-label-3 tabular-nums">{total ? `of ${total}` : ""}</p>
        </div>
        <p className="display mt-1 text-4xl tabular-nums">{count}</p>
        <div className="mt-3">
          <Bar value={total ? count / total : 0} color="bg-accent" />
        </div>
      </div>

      {total > 0 && (
        <dl className="mt-5 space-y-3.5">
          {LEVELS.map(({ key, color }) => {
            const ofLevel = problems.filter((p) => p.difficulty === key);
            const done = ofLevel.filter((p) => solvedIds.has(p.id)).length;
            return (
              <div key={key}>
                <div className="mb-1.5 flex justify-between text-[0.8125rem]">
                  <dt className="text-label-2">{key}</dt>
                  <dd className="text-label-3 tabular-nums">
                    {done}/{ofLevel.length}
                  </dd>
                </div>
                <Bar value={ofLevel.length ? done / ofLevel.length : 0} color={color} />
              </div>
            );
          })}
        </dl>
      )}
    </section>
  );
};

export default UserStatsPanel;
