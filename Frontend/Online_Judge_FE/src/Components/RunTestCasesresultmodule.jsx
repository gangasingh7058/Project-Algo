import { X } from 'lucide-react';

const RunTestCasesResultModule = ({ response, setshowresultmodule }) => {
  if (!response) return null;

  return (
    <div className="min-h-60 fixed bottom-0 left-0 right-0 bg-black border-t-2 border-cyan-400 z-50 p-4 shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-cyan-300 font-bold font-mono text-lg">
          {response.success ? '✅ All Test Cases Passed' : '❌ Test Case Failed'}
        </h2>
        <button onClick={()=>{setshowresultmodule(false)}} className="text-cyan-300 hover:text-red-400">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="font-mono text-sm text-purple-200 space-y-2">
        {response.success ? (
          <div>
            <p className="text-green-400">🎉 {response.msg}</p>
            <p>Total Test Cases: {response.totalTestCases}</p>
          </div>
        ) : (
          <>
            <p className="text-red-400">{response.msg}</p>
            {response.testcase && (
              <div className="bg-black/60 border border-purple-500 p-3 rounded space-y-1 mt-2">
                <p><span className="text-cyan-300">Failed Test Case:</span> #{response.failedTestCase}</p>
                <p><span className="text-cyan-300">Input:</span> {response.testcase}</p>
                <p><span className="text-cyan-300">Expected:</span> {response.expected}</p>
                <p><span className="text-cyan-300">Received:</span> {response.received}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RunTestCasesResultModule;
