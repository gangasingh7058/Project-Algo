import { Trophy } from "lucide-react";

// Contests are not live yet — keep this a quiet, honest status rather than a big empty panel.
const ContestsPanel = () => {
  return (
    <section className="card flex items-start gap-3.5 p-5" aria-label="Contests">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-warning/12 text-warning">
        <Trophy size={18} />
      </span>
      <div>
        <h2 className="text-[0.9375rem] font-semibold">Contests</h2>
        <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-label-2">
          No contests are running right now. Check back soon.
        </p>
      </div>
    </section>
  );
};

export default ContestsPanel;
