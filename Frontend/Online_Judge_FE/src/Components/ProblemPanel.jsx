import { Code2, CheckCircle, XCircle } from "lucide-react";

const ProblemsPanel = () => {
  const problems = [
    {
      id: 1,
      title: "Two Sum Matrix",
      difficulty: "Easy",
      solved: true,
      acceptance: "78%",
      tags: ["Array", "Hash Table"],
    },
    {
      id: 2,
      title: "Binary Tree Traversal",
      difficulty: "Medium",
      solved: false,
      acceptance: "45%",
      tags: ["Tree", "DFS"],
    },
    {
      id: 3,
      title: "Dynamic Programming Maze",
      difficulty: "Hard",
      solved: false,
      acceptance: "23%",
      tags: ["DP", "Graph"],
    },
    {
      id: 4,
      title: "String Manipulation",
      difficulty: "Easy",
      solved: true,
      acceptance: "89%",
      tags: ["String", "Sliding Window"],
    },
    {
      id: 5,
      title: "Graph Algorithms",
      difficulty: "Medium",
      solved: false,
      acceptance: "34%",
      tags: ["Graph", "BFS"],
    },
  ];

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
    <div className="bg-black/40 backdrop-blur-sm border-2 border-cyan-400/50 rounded-lg p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center mb-4 space-x-2 text-cyan-400 font-mono uppercase tracking-wider text-lg">
        <Code2 className="w-6 h-6" />
        <span>Problem Set</span>
      </div>

      {/* Problem List */}
      <div className="space-y-3">
        {problems.map((problem) => (
          <div
            key={problem.id}
            className="bg-black/30 border border-purple-500/30 rounded-lg p-4 hover:border-purple-400/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                {problem.solved ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-500" />
                )}
                <h3 className="text-white font-mono font-bold">{problem.title}</h3>
              </div>
              <span className={`font-mono font-bold ${getDifficultyColor(problem.difficulty)}`}>
                {problem.difficulty}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-wrap">
                <span className="text-gray-300 font-mono text-sm">
                  Acceptance: {problem.acceptance}
                </span>
                <div className="flex space-x-2 flex-wrap">
                  {problem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-purple-600/30 text-purple-300 rounded text-xs font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <button className="bg-cyan-600/80 hover:bg-cyan-500 text-black border border-cyan-400 font-mono uppercase text-xs px-3 py-1 rounded transition-all">
                Solve
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProblemsPanel;
