import { useState } from "react";
import Editor from "@monaco-editor/react";

const PastsubmissionModule = ({ pastSubmissions }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="bg-black/40 backdrop-blur-sm border-2 border-cyan-400/50 rounded-lg p-4 max-h-[75vh] overflow-y-auto space-y-4">
      {pastSubmissions.length === 0 ? (
        <p className="text-center text-purple-300 font-mono">No past submissions found.</p>
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

            {expandedIndex === index && (
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
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default PastsubmissionModule;
