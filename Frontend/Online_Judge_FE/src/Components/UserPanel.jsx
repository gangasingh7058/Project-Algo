import { propEffect } from "framer-motion";
import { User, Award, Target, TrendingUp, Star, Zap } from "lucide-react";

const UserStatsPanel = ( { solvecount , firstname , lastname } ) => {
  
  const xpProgress = (solvecount/ 10) * 100;

  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      <div className="bg-black/40 backdrop-blur-sm border-2 border-cyan-400/50 rounded-lg p-6 shadow-lg">
        <div className="text-center mb-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <User className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-cyan-400 font-mono text-xl">{firstname}</h2>
          <p className="text-purple-400 font-mono text-sm uppercase tracking-wider">{lastname}</p>
        </div>

        {/* Level Progress */}
        <div className="bg-black/30 rounded-lg p-3 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-mono">Solved {solvecount}</span>
            <span className="text-gray-400 font-mono text-sm">{solvecount}/{10} Problems</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-cyan-400 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${xpProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-black/30 rounded-lg p-3 text-center">
            <Target className="w-6 h-6 text-green-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-white font-mono">{solvecount ? solvecount : 0}</p>
            <p className="text-gray-400 font-mono text-xs uppercase">Problems</p>
          </div>
          {/* <div className="bg-black/30 rounded-lg p-3 text-center">
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
          </div> */}
        </div>
      </div>

    </div>
  );
};

export default UserStatsPanel;
