import Problem_Solve_Layout from "../Components/Problem_solve_layout";
import ProblemSolveCodeArea from "../Components/Problem_solve_codearea";
import { Page } from "../Components/ui";
import { useParams } from "react-router-dom";

const ProblemSolvePage = () => {
  const { pid } = useParams();

  return (
    <Page wide className="py-4 sm:py-6">
      {/* Two independently scrolling panes on large screens, stacked on small ones */}
      <div className="grid grid-cols-1 gap-4 lg:h-[calc(100dvh-3.5rem-3rem)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-5">
        <div className="min-h-0 lg:overflow-hidden">
          <Problem_Solve_Layout problemId={pid} />
        </div>
        <div className="min-h-0 lg:overflow-y-auto">
          <ProblemSolveCodeArea problemId={pid} />
        </div>
      </div>
    </Page>
  );
};

export default ProblemSolvePage;
