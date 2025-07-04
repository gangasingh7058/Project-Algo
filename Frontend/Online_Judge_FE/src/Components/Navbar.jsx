import { Code, Trophy, User, LogOut } from "lucide-react";

const RetroNavbar = () => {


  const Options=[
    {
      name:"HOME",
      route:"/home"
    },
    {
      name:"COMPILER",
      route:"/compiler"
    },
    {
      name:"Submissions",
      route:"/user/submissions"
    }
  ];


  return (
    <nav className="bg-black/30 backdrop-blur-md border-b-2 border-cyan-400/50 shadow-md px-2 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Code className="w-7 h-7 text-cyan-400 animate-pulse" />
          <h1 className="text-2xl font-bold text-cyan-400 font-mono tracking-widest retro-title-glow">
            CODING-ARENA
          </h1>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-6 ">
          {Options.map((option, idx) => (
            <a
              key={idx}
              href={option.route}
              className="text-cyan-300 hover:text-yellow-400 font-mono uppercase text-lg tracking-wider transition-all duration-200"
            >
              {option.name}
            </a>
          ))}
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-3 py-1.5 bg-purple-600/80 hover:bg-purple-500 text-white border-2 border-purple-400 font-mono text-sm uppercase rounded transition-all">
            <User className="w-4 h-4 mr-1" />
            Profile
          </button>
          <button className="p-2 bg-red-600/80 hover:bg-red-500 text-white border-2 border-red-400 rounded transition-all">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default RetroNavbar;
