import Problem_Solve_Layout from "../Components/Problem_solve_layout";
import ProblemSolveCodeArea from "../Components/Problem_solve_codearea";
import RetroNavbar from "../Components/Navbar";
import { useParams } from "react-router-dom";

const ProblemSolvePage = () => {


    const { pid }=useParams();



  return (
    <>
      <div className="min-h-screen bg-[url('/problem_solve.jpeg')] bg-cover bg-center bg-no-repeat text-white">
        {/* Navbar */}
        <RetroNavbar />

        {/* Main Content */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
            {/* Left Panel - Problem Details */}
            <div className="lg:col-span-2 max-h-[calc(100vh-100px)] overflow-y-auto">
              <Problem_Solve_Layout problemId={pid}/>
            </div>

            {/* Right Panel - Code Editor */}
            <div className="lg:col-span-4 max-h-[calc(100vh-100px)] overflow-y-auto">
              <ProblemSolveCodeArea />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProblemSolvePage;
