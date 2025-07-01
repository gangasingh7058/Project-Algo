import ProblemsPanel from "../Components/ProblemPanel";
import UserStatsPanel from "../Components/UserPanel";
import ContestsPanel from "../Components/ContestPanel";
import RetroNavbar from "../Components/Navbar";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-[url('/retro-home-bg.jpg')] bg-cover bg-no-repeat bg-center bg-fixed relative overflow-hidden flex flex-col">
      

      {/* Main content */}
      <div className="relative z-10">
        <RetroNavbar />

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Contests and Problems */}
            <div className="lg:col-span-2 space-y-6">
              <ContestsPanel />
              <ProblemsPanel />
            </div>

            {/* Right column - User Stats */}
            <div className="lg:col-span-1">
              <UserStatsPanel />
            </div>
          </div>
        </div>
      </div>

      {/* Optional scan lines effect */}
      <div className="absolute inset-0 pointer-events-none z-20">
        <div className="scan-lines"></div>
      </div>
    </div>
  );
};

export default HomePage;
