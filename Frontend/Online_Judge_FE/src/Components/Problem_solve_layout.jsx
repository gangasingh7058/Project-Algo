import { Trophy, Target, Clock } from "lucide-react";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import getusertoken from "../Helping Functions/getusertoken";
import PastsubmissionModule from "./pastSubmissionmodule";
import { CheckCircle } from 'lucide-react';

const Problem_Solve_Layout = ({ problemId }) => {


  const [problem, setProblem] = useState(null);
  const [pastSubmissions, setPastSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState("problem"); // "problem" or "submissions"
  const [gotproblem,setgotproblem]=useState(null);
  const navigate = useNavigate();

  // Get past submissions
  useEffect(() => {
    const getPastSubmissions = async () => {
      const token = getusertoken();

      if (!token) {
        alert("Unknown User");
        navigate("/user/signin");
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_PORT}/user/submission/${problemId}`,
          {
            headers: {
              usertoken: token,
            },
          }
        );
          
        if (response.data.success) {
          setPastSubmissions(response.data.submissions);
        }
      } catch (error) {
        // console.log(error);\
        alert("Error Fetching Past Submission Data");
      }
    };

    getPastSubmissions();
  }, [problemId]);

  // Get problem details
  useEffect(() => {
    const getProblem = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_PORT}/api/problem/${problemId}`
        );

        if (response.data.success === false) {
          // throw new Error("Failed to fetch problem");
          setgotproblem(false);
        }

        // console.log(response.data);
        
        setProblem(response.data.problem);
        setgotproblem(true);
      } catch (error) {
        // console.log(error);
        alert("Error Fetching Problem Details");
        setgotproblem(false);
      }
    };

    getProblem();
  }, [problemId]);

  if (gotproblem == null) {
    return (
      <div className="p-6 bg-black/40 backdrop-blur-sm border-2 border-cyan-400/50 rounded-lg">
        Fetching ...
      </div>
    );
  }

  if (gotproblem == false) {
    return (
      <div className="p-6 bg-black/40 backdrop-blur-sm border-2 border-cyan-400/50 rounded-lg">
        Error Fetching Problem
      </div>
    );
  }

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
    <div className="p-6 bg-black/40 backdrop-blur-sm border-2 border-cyan-400/50 rounded-lg">
      {/* Tab Buttons */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("problem")}
          className={`px-4 py-2 rounded-md font-mono ${
            activeTab === "problem"
              ? "bg-cyan-500 text-black"
              : "bg-cyan-900 text-white"
          }`}
        >
          Problem
        </button>
        <button
          onClick={() => setActiveTab("submissions")}
          className={`px-4 py-2 rounded-md font-mono ${
            activeTab === "submissions"
              ? "bg-cyan-500 text-black"
              : "bg-cyan-900 text-white"
          }`}
        >
          Past Submissions
        </button>
      </div>

      {/* Conditional Rendering */}
      {activeTab === "problem" ? (
        <>
          {/* title */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <div className="text-2xl font-bold text-cyan-400 font-mono uppercase tracking-wider">
                {problem.title}
              </div>
            </div>
            {/* Right Panel FOr Solution Difficulty Time */}
            <div className="flex flex-col md:flex-row gap-y-3 md:gap-y-0 md:space-x-6">
              {pastSubmissions.length > 0 && (
                <div className="flex items-center gap-1 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-mono text-lg">Solved</span>
                </div>
              )}

              <div className={`flex items-center gap-1 ${getDifficultyColor(problem.difficulty)}`}>
                <Target className="w-4 h-4" />
                <div className="font-mono text-sm">{problem.difficulty}</div>
              </div>

              <div className="flex items-center gap-1 text-purple-300">
                <Clock className="w-4 h-4" />
                <div className="font-mono text-sm">30 MIN</div>
              </div>
            </div>

          </div>

          {/* description */}
          <div className="mb-6">
            <div className="whitespace-pre-line text-lg font-bold text-cyan-400 font-mono uppercase tracking-wider mb-3">
              DESCRIPTION
            </div>
            <div className="text-purple-300 font-mono text-sm leading-relaxed">
              {problem.description}
            </div>
          </div>

          {/* input types */}
          <div className="mb-6">
            <div className="text-lg font-bold text-cyan-400 font-mono uppercase tracking-wider mb-3">
              INPUT TYPE
            </div>
            <div className="whitespace-pre-line text-purple-300 font-mono text-sm leading-relaxed">
              {problem.inputtype==""?"NO INPUT DETAILS":problem.inputtype}
            </div>
          </div>

          {/* constraints */}
          <div>
            <div className="text-lg font-bold text-cyan-400 font-mono uppercase tracking-wider mb-3">
              CONSTRAINTS
            </div>
            <div className="whitespace-pre-line text-purple-300 font-mono text-sm space-y-1">
              <div>{problem.constraints==""?"NO CONSTRAINTS":problem.constraints}</div>
            </div>
          </div>

          {/* test cases */}
          <div className="mt-8">
            <div className="text-lg font-bold text-cyan-400 font-mono uppercase tracking-wider mb-3">
              Example Test Cases
            </div>

            {problem.testCases.map((testcase, index) => (
              <div
                key={testcase.id || index}
                className="mb-4 p-4 bg-black/30 border border-purple-500/30 rounded-lg"
              >
                <div className="text-sm font-mono text-purple-300 mb-2">
                  <span className="text-cyan-300 font-bold">
                    Test Case {index + 1}
                  </span>
                </div>
                <div className="text-sm font-mono text-gray-300 space-y-2">
                  <div className="flex items-start">
                    <span className="text-purple-400 font-bold min-w-[70px]">Input:</span>
                    <pre className="whitespace-pre-wrap bg-gray-800 p-2 rounded flex-1">
                      {testcase.input}
                    </pre>
                  </div>
                  <div className="flex items-start">
                    <span className="text-purple-400 font-bold min-w-[70px]">Output:</span>
                    <pre className="whitespace-pre-wrap bg-gray-800 p-2 rounded flex-1">
                      {testcase.output}
                    </pre>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* tags */}
          <div className="mb-6">
            <div className="text-lg font-bold text-cyan-400 font-mono uppercase tracking-wider mb-3">
              TOPIC
            </div>
            <div className="flex flex-wrap gap-2">
              {problem.tags.map((tagObj, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-600/30 text-purple-300 rounded text-xs font-mono"
                >
                  {tagObj.tag.tagName}
                </span>
              ))}
            </div>
          </div>
        </>
      ) : (
        <PastsubmissionModule pastSubmissions={pastSubmissions} />
      )}
    </div>
  );
};

export default Problem_Solve_Layout;
