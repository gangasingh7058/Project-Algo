import { Code2, CheckCircle, XCircle } from "lucide-react";
import axios from 'axios'
import { useState } from "react";
import { useEffect } from "react";
import { useFetcher } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const ProblemsPanel = () => {

  const navigate=useNavigate();
  const [problems,setproblem]=useState([]);



  useEffect(()=>{

    const getProblems=async ()=>{

       try {
            const problemlist=await axios.get('http://localhost:3001/api/problems')

            // error Fetching Problem

            if(problemlist.data.success==false){
              throw error;
            }
            setproblem(problemlist.data.problems)

        } catch (error) {
          alert("Error Fetching Problem List")
        }


    }

   getProblems();

  },[])


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
            className="bg-black/30 border border-purple-500/30 rounded-lg py-4 px-6 hover:border-purple-400/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                {/* {problem.solved ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-500" />
                )} */}
                <h3 className="text-white text-2xl font-mono font-bold">{problem.title}</h3>
              </div>
              <span className={`font-mono font-bold ${getDifficultyColor(problem.difficulty)} text-xl`}>
                {problem.difficulty}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-wrap">
                {/* <span className="text-gray-300 font-mono text-sm">
                  Acceptance: {problem.acceptance}
                </span> */}
                <div className="flex space-x-2 flex-wrap">
                  {problem.tags.map((tagobj) => (
                    <span
                      key={tagobj.tag.id}
                      className="px-2 py-1 bg-purple-600/30 text-purple-300 rounded text-xs font-mono"
                    >
                      {tagobj.tag.tagName}
                    </span>
                  ))}
                </div>
              </div>

              <button 
              className="bg-cyan-600/80 hover:bg-cyan-500 text-black border border-cyan-400 font-mono uppercase text-xs px-3 py-1 rounded transition-all"
              onClick={()=>{navigate(`/home/problem/${problem.id}`)}}
              >
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
