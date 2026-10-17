import { useState } from "react";
import { motion } from "framer-motion";
import { spring } from "../../Helping Functions/motion";

// Round an axis maximum up to 1 / 2 / 5 × 10ⁿ so gridlines land on clean values
const niceMax = (v) => {
  if (v <= 4) return 4;
  const p = 10 ** Math.floor(Math.log10(v));
  const m = [1, 2, 5, 10].find((s) => s * p >= v);
  return m * p;
};

const fmtDay = (iso, opts = { month: "short", day: "numeric" }) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, opts);

/*
 * Single-series column chart over days.
 * Bars: 4px rounded data-ends on a baseline, 2px gaps; recessive gridlines.
 * Hover / focus a column → tooltip (value first, date second). Arrow keys move between days.
 */
export const DailyColumns = ({ data, label = "Submissions" }) => {
  const [active, setActive] = useState(null);
  const max = niceMax(Math.max(0, ...data.map((d) => d.count)));
  const ticks = [max, max / 2, 0];
  const n = data.length;
  const labelIdx = [0, Math.floor((n - 1) / 2), n - 1];

  const onKey = (e) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    setActive((i) => {
      if (e.key === "Home") return 0;
      if (e.key === "End") return n - 1;
      const cur = i ?? (e.key === "ArrowLeft" ? n : -1);
      return Math.min(n - 1, Math.max(0, cur + (e.key === "ArrowRight" ? 1 : -1)));
    });
  };

  return (
    <div className="flex gap-3">
      {/* y-axis ticks */}
      <div className="flex h-48 flex-col justify-between pb-px text-right text-[0.6875rem] tabular-nums text-label-3" aria-hidden="true">
        {ticks.map((t) => <span key={t} className="-translate-y-1/2 leading-none first:translate-y-0 last:translate-y-0">{t}</span>)}
      </div>

      <div className="min-w-0 flex-1">
        <div
          role="img"
          tabIndex={0}
          aria-label={`${label} per day. Use arrow keys to read each day.`}
          onKeyDown={onKey}
          onBlur={() => setActive(null)}
          onPointerLeave={() => setActive(null)}
          className="focus-ring relative h-48 rounded-sm"
        >
          {/* gridlines */}
          {ticks.map((t, i) => (
            <div
              key={t}
              className={`absolute inset-x-0 border-t ${i === ticks.length - 1 ? "border-label-3/60" : "border-hairline"}`}
              style={{ top: `${(i / (ticks.length - 1)) * 100}%` }}
            />
          ))}

          <div className="absolute inset-0 flex items-end">
            {data.map((d, i) => {
              const h = (d.count / max) * 100;
              const on = active === i;
              return (
                <div
                  key={d.date}
                  className="relative flex h-full flex-1 items-end px-px"
                  onPointerEnter={() => setActive(i)}
                >
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ ...spring, delay: Math.min(i, 30) * 0.008 }}
                    style={{ height: d.count ? `max(${h}%, 3px)` : 0 }}
                    className={`w-full origin-bottom rounded-t-[4px] transition-colors ${
                      on ? "bg-accent-hover" : active !== null ? "bg-accent/55" : "bg-accent"
                    }`}
                  />
                  {on && (
                    <div
                      role="status"
                      className={`glass pointer-events-none absolute z-10 whitespace-nowrap rounded-lg border border-hairline px-2.5 py-1.5 shadow-xl shadow-black/50 ${
                        i < n / 4 ? "left-0" : i > (3 * n) / 4 ? "right-0" : "left-1/2 -translate-x-1/2"
                      }`}
                      style={{ bottom: `calc(${h}% + 0.5rem)` }}
                    >
                      <p className="text-sm font-semibold tabular-nums">{d.count}</p>
                      <p className="text-[0.6875rem] text-label-2">{fmtDay(d.date, { weekday: "short", month: "short", day: "numeric" })}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* x-axis labels */}
        <div className="relative mt-2 h-4 text-[0.6875rem] text-label-3" aria-hidden="true">
          {labelIdx.map((i, k) => (
            <span
              key={i}
              className={`absolute ${k === 0 ? "left-0" : k === 2 ? "right-0" : "-translate-x-1/2"}`}
              style={k === 1 ? { left: `${((i + 0.5) / n) * 100}%` } : undefined}
            >
              {fmtDay(data[i].date)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export const DailyTable = ({ data }) => (
  <div className="max-h-56 overflow-y-auto rounded-xl bg-fill">
    <table className="w-full text-sm">
      <thead className="sticky top-0 bg-surface-2 text-left text-xs text-label-3">
        <tr>
          <th className="px-3.5 py-2 font-medium">Date</th>
          <th className="px-3.5 py-2 text-right font-medium">Submissions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-hairline">
        {[...data].reverse().map((d) => (
          <tr key={d.date}>
            <td className="px-3.5 py-1.5 text-label-2">{fmtDay(d.date, { weekday: "short", month: "short", day: "numeric" })}</td>
            <td className="px-3.5 py-1.5 text-right tabular-nums">{d.count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/*
 * Labeled horizontal bars for a magnitude comparison (single hue — the label names each row,
 * so color never carries identity). Values are direct-labeled in text ink.
 */
export const HBars = ({ rows, empty = "No data yet" }) => {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) return <p className="py-6 text-center text-sm text-label-3">{empty}</p>;
  return (
    <ul className="space-y-3.5">
      {rows.map((r, i) => (
        <li key={r.key}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[0.8125rem]">
            <span className="min-w-0 truncate text-label">{r.label}</span>
            <span className="shrink-0 tabular-nums text-label-2">{r.display ?? r.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-fill-2">
            <motion.div
              className="h-full w-full origin-left rounded-full bg-accent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: r.value / max }}
              transition={{ ...spring, duration: 0.7, delay: i * 0.04 }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
};
