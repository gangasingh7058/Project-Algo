import { Trophy, Clock, Users } from "lucide-react";

const ContestsPanel = () => {
  const contests = [
    {
      id: 1,
      name: "Weekly Challenge #42",
      status: "Live",
      participants: 1337,
      timeLeft: "2h 15m",
      difficulty: "Medium",
    },
    {
      id: 2,
      name: "Algorithmic Arena",
      status: "Upcoming",
      participants: 892,
      timeLeft: "1d 4h",
      difficulty: "Hard",
    },
    {
      id: 3,
      name: "Speed Coding Blitz",
      status: "Upcoming",
      participants: 445,
      timeLeft: "3d 12h",
      difficulty: "Easy",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Live":
        return "text-green-400 bg-green-400/20";
      case "Upcoming":
        return "text-yellow-400 bg-yellow-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-400";
      case "Medium":
        return "text-yellow-400";
      case "Hard":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-sm border-2 border-cyan-400/50 rounded-lg shadow-lg p-6 space-y-4">
      <div className="flex items-center space-x-2 text-cyan-400 font-mono uppercase tracking-wider text-lg mb-2">
        <Trophy className="w-6 h-6" />
        <span>Active Contests</span>
      </div>

    <div className="text-cyan-400 font-mono uppercase tracking-wider text-lg mb-2">
        No Active Contest Now
    </div>


      {/* {contests.map((contest) => (
        <div
          key={contest.id}
          className="bg-black/30 border border-purple-500/30 rounded-lg p-4 hover:border-purple-400/50 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-mono font-bold">{contest.name}</h3>
            <span
              className={`px-2 py-1 rounded text-xs font-mono uppercase ${getStatusColor(contest.status)}`}
            >
              {contest.status}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-gray-300">
                <Users className="w-4 h-4" />
                <span className="font-mono">{contest.participants}</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-300">
                <Clock className="w-4 h-4" />
                <span className="font-mono">{contest.timeLeft}</span>
              </div>
              <span
                className={`font-mono font-bold ${getDifficultyColor(contest.difficulty)}`}
              >
                {contest.difficulty}
              </span>
            </div>

            <button
              className="bg-cyan-600/80 hover:bg-cyan-500 text-black border border-cyan-400 font-mono uppercase tracking-wide px-4 py-1 rounded transition-all text-sm"
            >
              {contest.status === "Live" ? "Join" : "Register"}
            </button>
          </div>
        </div>
      ))} */}
    </div>
  );
};

export default ContestsPanel;
