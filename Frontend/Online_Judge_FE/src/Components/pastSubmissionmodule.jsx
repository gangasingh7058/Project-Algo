import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import getusertoken from "../Helping Functions/getusertoken";


const PastsubmissionModule = ({ pastSubmissions }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [token,setusertoken]=useState(null);


  useEffect(()=>{


    const checkusersignin=()=>{
        setusertoken(getusertoken());
    }

    checkusersignin();
  })

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="bg-black/40 backdrop-blur-sm border-2 border-cyan-400/50 rounded-lg p-4 max-h-[75vh] overflow-y-auto space-y-4">
      {pastSubmissions.length === 0 ? (
        <p className="text-center text-purple-300 font-mono">{token?"No past submissions found.":" Login to See Submissions "}</p>
      ) : (
        pastSubmissions.map((submission, index) => (
          <div
            key={index}
            className="border border-purple-500/30 rounded-md p-4 bg-black/30 shadow-md hover:bg-black/50 transition duration-200 cursor-pointer"
            onClick={() => toggleExpand(index)}
          >
            <div className="w-full flex flex-col  sm:flex-row sm:justify-between sm:items-end">
              <p className="font-semibold text-cyan-300 font-mono">Submission {index + 1}</p>
              <p className="text-sm text-purple-300 font-mono">
                {new Date(submission.date).toLocaleString()}
              </p>
            </div>

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
                      <div className="mt-4">
                        <Editor
                          height="300px"
                          defaultLanguage="cpp"
                          defaultValue={submission.code}
                          theme="vs-dark"
                          options={{
                            readOnly: true,
                            fontSize: 14,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            wordWrap: "on",
                          }}
                        />
                      </div>
                  </motion.div>
                )}
            </AnimatePresence>
          </div>
        ))
      )}
    </div>
  );
};

export default PastsubmissionModule;
