import { User, Award, Target, TrendingUp, Star, Zap } from "lucide-react";

const UserStatsPanel = () => {
  const userStats = {
    username: "CodeWarrior",
    rank: "Elite Hacker",
    level: 42,
    xp: 15420,
    nextLevelXp: 20000,
    problemsSolved: 187,
    contestsWon: 23,
    streak: 15,
    accuracy: 87,
  };

  const achievements = [
    { name: "First Blood", icon: "🏆", rarity: "legendary" },
    { name: "Speed Demon", icon: "⚡", rarity: "epic" },
    { name: "Problem Solver", icon: "🧩", rarity: "rare" },
    { name: "Perfectionist", icon: "💎", rarity: "legendary" },
  ];

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case "legendary":
        return "border-yellow-400 bg-yellow-400/10 text-yellow-400";
      case "epic":
        return "border-purple-400 bg-purple-400/10 text-purple-400";
      case "rare":
        return "border-blue-400 bg-blue-400/10 text-blue-400";
      default:
        return "border-gray-400 bg-gray-400/10 text-gray-400";
    }
  };

  const xpProgress = (userStats.xp / userStats.nextLevelXp) * 100;

  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      <div className="bg-black/40 backdrop-blur-sm border-2 border-cyan-400/50 rounded-lg p-6 shadow-lg">
        <div className="text-center mb-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <User className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-cyan-400 font-mono text-xl">{userStats.username}</h2>
          <p className="text-purple-400 font-mono text-sm uppercase tracking-wider">{userStats.rank}</p>
        </div>

        {/* Level Progress */}
        <div className="bg-black/30 rounded-lg p-3 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-mono">Level {userStats.level}</span>
            <span className="text-gray-400 font-mono text-sm">{userStats.xp}/{userStats.nextLevelXp} XP</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-cyan-400 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${xpProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/30 rounded-lg p-3 text-center">
            <Target className="w-6 h-6 text-green-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-white font-mono">{userStats.problemsSolved}</p>
            <p className="text-gray-400 font-mono text-xs uppercase">Problems</p>
          </div>
          <div className="bg-black/30 rounded-lg p-3 text-center">
            <Award className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-white font-mono">{userStats.contestsWon}</p>
            <p className="text-gray-400 font-mono text-xs uppercase">Contests</p>
          </div>
          <div className="bg-black/30 rounded-lg p-3 text-center">
            <Zap className="w-6 h-6 text-orange-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-white font-mono">{userStats.streak}</p>
            <p className="text-gray-400 font-mono text-xs uppercase">Day Streak</p>
          </div>
          <div className="bg-black/30 rounded-lg p-3 text-center">
            <TrendingUp className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-white font-mono">{userStats.accuracy}%</p>
            <p className="text-gray-400 font-mono text-xs uppercase">Accuracy</p>
          </div>
        </div>
      </div>

      {/* Achievements */}
      {/* <div className="bg-black/40 backdrop-blur-sm border-2 border-cyan-400/50 rounded-lg p-6 shadow-lg">
        <div className="flex items-center space-x-2 text-cyan-400 font-mono uppercase tracking-wider text-lg mb-4">
          <Star className="w-5 h-5" />
          <span>Achievements</span>
        </div>
        <div className="space-y-3">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className={`border rounded-lg p-3 font-mono ${getRarityColor(achievement.rarity)}`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{achievement.icon}</span>
                <div>
                  <p className="font-bold">{achievement.name}</p>
                  <p className="text-xs uppercase tracking-wider opacity-75">{achievement.rarity}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
};

export default UserStatsPanel;
