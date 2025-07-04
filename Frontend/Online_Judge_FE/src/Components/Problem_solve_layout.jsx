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
          `http://localhost:3001/user/submission/${problemId}`,
          {
            headers: {
              usertoken: token,
            },
          }
        );
          console.log(response.data);
        if (response.data.success) {
          setPastSubmissions(response.data.submissions);
        }
      } catch (error) {
        console.log(error);
      }
    };

    getPastSubmissions();
  }, [problemId]);

  // Get problem details
  useEffect(() => {
    const getProblem = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/problem/${problemId}`
        );

        if (response.data.success === false) {
          throw new Error("Failed to fetch problem");
        }

        setProblem(response.data.problem);
      } catch (error) {
        console.log(error);
        alert("Error Fetching Problem Details");
      }
    };

    getProblem();
  }, [problemId]);

  if (problem == null) {
    return (
      <div className="p-6 bg-black/40 backdrop-blur-sm border-2 border-cyan-400/50 rounded-lg">
        Error Fetching Problem
      </div>
    );
  }

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
            <div className="flex space-x-6">

              {pastSubmissions.length > 0 && (
                <div className="flex items-center space-x-1 text-green-400 gap-1">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-mono text-lg">Solved</span>
                </div>
              )}

             
              <div className="flex items-center space-x-1 text-green-400">
                <Target className="w-4 h-4" />
                <div className="font-mono text-sm">{problem.difficulty}</div>
              </div>
              <div className="flex items-center space-x-1 text-purple-300">
                <Clock className="w-4 h-4" />
                <div className="font-mono text-sm">30 MIN</div>
              </div>
            </div>
          </div>

          {/* description */}
          <div className="mb-6">
            <div className="text-lg font-bold text-cyan-400 font-mono uppercase tracking-wider mb-3">
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
            <div className="text-purple-300 font-mono text-sm leading-relaxed">
              INPUT DESCRIPTION
            </div>
          </div>

          {/* constraints */}
          <div>
            <div className="text-lg font-bold text-cyan-400 font-mono uppercase tracking-wider mb-3">
              CONSTRAINTS
            </div>
            <div className="text-purple-300 font-mono text-sm space-y-1">
              <div>LIST OF CONSTRAINTS</div>
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
                <div className="text-sm font-mono text-gray-300">
                  <div>
                    <span className="text-purple-400 font-bold">Input:</span>{" "}
                    <pre className="inline whitespace-pre-wrap">
                      {testcase.input}
                    </pre>
                  </div>
                  <div>
                    <span className="text-purple-400 font-bold">Output:</span>{" "}
                    <pre className="inline whitespace-pre-wrap">
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
