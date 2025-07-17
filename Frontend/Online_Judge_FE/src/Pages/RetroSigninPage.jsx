import { useState } from "react";
import { Gamepad2, Zap, Star, Trophy } from "lucide-react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';


const RetroSigninPage = () => {


  // To Navigate to Other Routes
  const navigate=useNavigate();

  const [userdetails,setuserdetails]=useState({
    username:"",
    password:""
  })
  const [isLoading, setIsLoading] = useState(false);

  const handleOnChange= (e)=>{
    const {name,value}=e.target;
    setuserdetails({
      ...userdetails,
      [name]:value
    })    
  }

const handleSubmit = async (e) => {
  e.preventDefault();

  // console.log(userdetails);
  // return ;
  

  setIsLoading(true);

  try {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_PORT}/new/user/signin`, userdetails);

    // User SignIn Fails
    if (response.data.success === false) {
      alert(response.data.msg);
    } else {
      // User SignIn Success
      localStorage.setItem('token', `bearer ${response.data.jwt_token}`);
      // Redirect To HomePage
      // console.log(response.data);
      navigate('/home')
    }

  } catch (error) {
    console.error("Error during sign in:", error);
    alert("Something went wrong. Please try again.");
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-[url('/retro-bg.jpg')] bg-cover bg-center bg-no-repeat flex items-center justify-center px-4">
      <div className="bg-black/80 border-2 border-cyan-400 shadow-2xl shadow-cyan-400/25 backdrop-blur-sm rounded-lg overflow-hidden w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="retro-title-glow mb-4">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 font-mono tracking-wider">
              CODING ARCADE
            </h1>
            <div className="flex justify-center gap-2 mt-2">
              <Star className="w-6 h-6 text-yellow-400 animate-pulse" />
              <Gamepad2 className="w-8 h-8 text-cyan-400 animate-bounce" />
              <Star className="w-6 h-6 text-yellow-400 animate-pulse" />
            </div>
          </div>
          <p className="text-cyan-300 font-mono text-sm tracking-widest">
            LOGIN REQUIRED
          </p>
        </div>

        {/* High Score */}
        <div className="flex justify-between items-center mb-6 p-3 bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-cyan-400/30 rounded">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-cyan-300 font-mono text-sm">HIGH SCORE</span>
          </div>
          <span className="text-pink-400 font-mono font-bold">999999</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="username" className="text-cyan-300 font-mono text-sm tracking-wide uppercase">
              USER ID (Email)
            </label>
            <div className="relative">
              <input
                id="username"
                type="email"
                name="username"
                value={userdetails.username}
                onChange={handleOnChange}
                className="w-full bg-black/50 border-2 border-purple-500 text-cyan-300 font-mono placeholder-purple-300/50 rounded-md px-4 py-2 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 transition-all duration-300"
                placeholder="enter_your_email"
                required
              />
              <div className="absolute inset-0 rounded-md pointer-events-none retro-input-glow" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-cyan-300 font-mono text-sm tracking-wide uppercase">
              Access key
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                name="password"
                value={userdetails.password}
                onChange={handleOnChange}
                className="w-full bg-black/50 border-2 border-purple-500 text-cyan-300 font-mono placeholder-purple-300/50 rounded-md px-4 py-2 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 transition-all duration-300"
                placeholder="enter_password"
                autoComplete="current-password"
                required
              />
              <div className="absolute inset-0 rounded-md pointer-events-none retro-input-glow" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-mono font-bold text-lg py-3 rounded-md border-2 border-pink-400 shadow-lg shadow-pink-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                LOADING...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" />
                START ENGINE
              </div>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-cyan-400/30">
          <div className="flex justify-end text-sm">
            <button 
            className="text-cyan-400 hover:text-cyan-300 font-mono transition-colors duration-300"
            onClick={()=>{
              navigate('/user/register')
            }}
            >
              NEW_USER?
            </button>
          </div>
        </div>

        {/* Decorative Bottom */}
        <div className="mt-8 text-center">
          <div className="flex justify-center gap-4 text-2xl">
            {["◆", "◇", "◆", "◇", "◆"].map((symbol, i) => (
              <span
                key={i}
                className="text-cyan-400 animate-pulse font-mono"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: "1.5s",
                }}
              >
                {symbol}
              </span>
            ))}
          </div>
          <p className="text-purple-300 font-mono text-xs mt-2 tracking-widest">
            INSERT COIN TO CONTINUE
          </p>
        </div>
      </div>
    </div>
  );
};

export default RetroSigninPage;
