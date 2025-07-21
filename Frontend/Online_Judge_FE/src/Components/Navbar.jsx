import { useEffect, useState } from "react";
import { Code, LogOut, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import getusertoken from "../Helping Functions/getusertoken";

const RetroNavbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [token,settoken]=useState(null);

  useEffect(()=>{

    const verifyusertoken=()=>{
      settoken(getusertoken());
    }

    verifyusertoken();

  },[])

  const Options = [
    {
      name: "HOME",
      route: "/home",
    },
    {
      name: "COMPILER",
      route: "/compiler",
    },
    {
      name: "Submissions",
      route: "/user/submissions",
    },
  ];

  const HandleLogOut = () => {
    localStorage.clear("token");
    settoken(null);
    // navigate("/user/signin");
  };

  return (
    <nav className="bg-black/30 backdrop-blur-md border-b-2 border-cyan-400/50 shadow-md px-2 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Code className="w-7 h-7 text-cyan-400 animate-pulse" />
          <h1 className="text-2xl font-bold text-cyan-400 font-mono tracking-widest retro-title-glow">
            <a href="/home">CODE-ARCADE</a>
          </h1>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center space-x-6">
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

        {/* Right Side Actions */}
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Toggle Button */}
          <button
            className="md:hidden text-cyan-300 hover:text-yellow-400"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/*Login - Logout Button */}
          {token ? (
              <button
                className="p-2 bg-red-600/80 hover:bg-red-500 text-white border-2 border-red-400 rounded transition-all"
                onClick={HandleLogOut}
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                className="p-2 hover:bg-green-500 text-white border-2 border-green-400 rounded transition-all text-sm"
                onClick={() => navigate("/user/signin")}
              >
                Login
              </button>
            )}

        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden flex flex-col space-y-2 mt-2 px-4">
          {Options.map((option, idx) => (
            <a
              key={idx}
              href={option.route}
              className="text-cyan-300 hover:text-yellow-400 font-mono uppercase text-lg tracking-wider transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(false)} // close menu after click
            >
              {option.name}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

export default RetroNavbar;
