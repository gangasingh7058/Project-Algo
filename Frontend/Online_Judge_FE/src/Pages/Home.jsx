import ProblemsPanel from "../Components/ProblemPanel";
import UserStatsPanel from "../Components/UserPanel";
import ContestsPanel from "../Components/ContestPanel";
import RetroNavbar from "../Components/Navbar";
import axios from "axios";
import getusertoken from "../Helping Functions/getusertoken";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import dotenv from 'dotenv'

const HomePage =() => {

    // dotenv.config();

    const navigate=useNavigate();
    const token=getusertoken();

    const [userdetails,setuserdetails]=useState(null);
    const [verifieluser,setverifieduser]=useState(false);
    useEffect(()=>{

      const getuserdetails=async ()=>{
            
            if(!token){
              setverifieduser(false);
              alert("Unknown User");
              navigate("/user/signin")
            }
            else{
              setverifieduser(true);
            }

            try {
              const response=await axios.get(`${import.meta.env.VITE_BACKEND_PORT}/user/profile`,{
                headers:{
                  usertoken:token
                }
              })

              if(response.data.success==false){
                throw error(response.data.message)
              }
              setuserdetails(response.data);
                                     
              // console.log(response.data);
              
            } catch (error) {
                // console.log(error);
                if(verifieluser==false)return;
                alert("Error Fetching User Details");
                 
            }
      }

      getuserdetails();

    },[])

    if(verifieluser==false){
      return <>
      
      </>
    }

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
              <ProblemsPanel problemssolved={ (userdetails==null)?[]:userdetails.user.solved} />
            </div>

            {/* Right column - User Stats */}
            <div className="lg:col-span-1">
              <UserStatsPanel firstname={(userdetails==null)?null:userdetails.user.firstname} lastname={(userdetails==null)?null:userdetails.user.lastname} solvecount={(userdetails==null)?0:userdetails.user.solved.length} />
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
