import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { CheckCircle } from "lucide-react";
import axios from "axios";
import RetroNavbar from "../Components/Navbar";
import { useNavigate } from "react-router-dom";
import getusertoken from "../Helping Functions/getusertoken";
import { motion, AnimatePresence } from "framer-motion";

const SubmissionsPage = () => {


  const [expandedIndex, setExpandedIndex] = useState(null);
  const [pastSubmissions, setPastSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const toggleExpand = (index) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  useEffect(() => {
    const getSubmissions = async () => {
      const token = getusertoken();

      if (!token) {
        alert("Unknown User");
        navigate("/user/signin");
        return;
      }
      
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_PORT}/user/submission`, {
          headers: { usertoken: token },
        });

        // console.log(response.data);
        
        if (response.data.success) {
          setPastSubmissions(response.data.solved);
        } else {
          // console.log(response.data.message);
        }
      } catch (error) {
        console.error("Error fetching submissions:", error);
      } finally {
        setLoading(false);
      }
    };

    getSubmissions();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 font-mono text-white pb-10">
      <RetroNavbar />

      <div className="pt-6 relative z-10 px-6">
        <h1 className="text-5xl font-bold text-cyan-400 text-center mb-8 drop-shadow-[0_0_10px_#22d3ee]">
          Your Submissions
        </h1>

        {loading ? (
          <div className="text-center text-cyan-300 text-xl mt-20">
            Loading...
          </div>
        ) : pastSubmissions.length === 0 ? (
          <div className="text-center text-cyan-300 text-xl mt-20">
            No submissions yet.
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-6">
            {pastSubmissions.map((sub, index) => (
              <div
                key={index}
                className="bg-black/30 rounded-xl border border-cyan-400/20 shadow-xl backdrop-blur-md transition-all"
              >
                {/* Header */}
                <div
                  onClick={() => toggleExpand(index)}
                  className="flex justify-between items-center px-6 py-4 cursor-pointer hover:bg-black/40"
                >
                  <div>
                    <div className="text-xl font-semibold text-white">
                      {index+1}.{" "}
                      {sub.problem.title}
                    </div>
                    <div className="text-sm text-cyan-300">
                      {new Date(sub.date).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-cyan-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Solved</span>
                  </div>
                </div>

                {/* Code Viewer */}
                <AnimatePresence initial={false}>
                    {expandedIndex === index && (
                      <motion.div
                        key="editor"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.6 }}
                        className="border-t border-cyan-400/10"
                      >
                        <Editor
                          height="300px"
                          language="cpp"
                          value={sub.code}
                          theme="vs-dark"
                          options={{
                            readOnly: true,
                            fontSize: 16,
                            minimap: { enabled: false },
                            padding: { top: 10 },
                          }}
                        />
                      </motion.div>
                    )}
                </AnimatePresence>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionsPage;
