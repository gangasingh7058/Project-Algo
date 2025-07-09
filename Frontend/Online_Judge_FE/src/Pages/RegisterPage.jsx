import { useState } from "react";
import { Gamepad2, Zap, Star, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const RegisterPage = () => {

  const navigate=useNavigate();

  const [userDetails, setUserDetails] = useState({
    username: "",
    password: "",
    firstname: "",
    lastName: "",
    dob: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  // generic change handler for every input
  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(userDetails);

        setIsLoading(true);

        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_PORT}/new/user/register`, userDetails);

            // User Register Fails
            if (response.data.success === false) {
            alert(response.data.msg);
            } else {
            // User SignIn Success
            localStorage.setItem('token', `bearer: ${response.data.jwt_token}`);
            // Redirect To HomePage
            console.log(response.data);
            navigate('/home')
    }
        } catch (error) {
            console.error("Error during sign in:", error);
            alert("Something went wrong. Please try again.");
        }
        finally{
            setIsLoading(false);
        }
        
  }
   

  return (
    <div className="min-h-screen bg-[url('/retro-bg.jpg')] bg-cover bg-center bg-no-repeat flex items-center justify-center px-4">
      <div className="bg-black/80 border-2 border-cyan-400 shadow-2xl shadow-cyan-400/25 backdrop-blur-sm rounded-lg overflow-hidden w-full max-w-lg p-8">
        {/* Header */}
        <div className="text-center mb-2">
          <div className="retro-title-glow mb-2">
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
            REGISTER TO THE CODING ARCADE
          </p>
        </div>

        {/* High Score strip */}
        <div className="flex justify-between items-center mb-4 p-3 bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-cyan-400/30 rounded">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-cyan-300 font-mono text-sm">HIGH SCORE</span>
          </div>
          <span className="text-pink-400 font-mono font-bold">999999</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* First name ‑ Last name ‑ DOB */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstname"
                className="text-cyan-300 font-mono text-sm tracking-wide uppercase"
              >
                FIRST NAME
              </label>
              <input
                id="firstname"
                name="firstname"
                type="text"
                value={userDetails.firstname}
                onChange={handleOnChange}
                className="w-full bg-black/50 border-2 border-purple-500 text-cyan-300 font-mono placeholder-purple-300/50 rounded-md px-4 py-2 mt-1 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 transition-all duration-300"
                placeholder="John"
                required
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="text-cyan-300 font-mono text-sm tracking-wide uppercase"
              >
                LAST NAME
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={userDetails.lastName}
                onChange={handleOnChange}
                className="w-full bg-black/50 border-2 border-purple-500 text-cyan-300 font-mono placeholder-purple-300/50 rounded-md px-4 py-2 mt-1 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 transition-all duration-300"
                placeholder="Doe"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="dob"
                className="text-cyan-300 font-mono text-sm tracking-wide uppercase"
              >
                DATE OF BIRTH
              </label>
              <input
                id="dob"
                name="dob"
                type="date"
                value={userDetails.dob}
                onChange={handleOnChange}
                className="w-full bg-black/50 border-2 border-purple-500 text-cyan-300 font-mono rounded-md px-4 py-2 mt-1 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 transition-all duration-300"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="text-cyan-300 font-mono text-sm tracking-wide uppercase"
            >
              USER ID (Email)
            </label>
            <input
              id="username"
              name="username"
              type="email"
              value={userDetails.username}
              onChange={handleOnChange}
              className="w-full bg-black/50 border-2 border-purple-500 text-cyan-300 font-mono placeholder-purple-300/50 rounded-md px-4 py-2 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 transition-all duration-300"
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-cyan-300 font-mono text-sm tracking-wide uppercase"
            >
              ACCESS KEY
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={userDetails.password}
              onChange={handleOnChange}
              className="w-full bg-black/50 border-2 border-purple-500 text-cyan-300 font-mono placeholder-purple-300/50 rounded-md px-4 py-2 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 transition-all duration-300"
              placeholder="********"
              autoComplete="current-password"
              required
            />
          </div>

          {/* Submit */}
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
                navigate('/user/signin')
            }}
            >
              ALREADY A MEMBER?
            </button>
          </div>
        </div>

        {/* Decorative footer */}
        
      </div>
    </div>
  );
};

export default RegisterPage;
