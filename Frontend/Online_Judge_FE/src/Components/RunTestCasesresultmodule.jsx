import { X, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const RunTestCasesResultModule = ({ response, setshowresultmodule }) => {
  if (!response) return null;

  const isCompilationError = response.errorcode === 3 || response.msg === "Compilation Failed";
  const errDetail = response.err || response.error;

  return (
    <div className="min-h-60 fixed bottom-0 left-0 right-0 bg-black/95 border-t-2 border-cyan-400 z-50 p-4 shadow-2xl backdrop-blur-md font-mono">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-cyan-300 font-bold text-lg flex items-center gap-2">
          {response.success ? (
            <>
              <CheckCircle className="w-6 h-6 text-green-400" />
              <span>All Test Cases Passed</span>
            </>
          ) : isCompilationError ? (
            <>
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
              <span>Compilation Error</span>
            </>
          ) : (
            <>
              <XCircle className="w-6 h-6 text-red-400" />
              <span>Test Case Failed</span>
            </>
          )}
        </h2>
        <button 
          onClick={() => { setshowresultmodule(false); }} 
          className="text-cyan-300 hover:text-red-400 transition-colors p-1 rounded-md hover:bg-white/10"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="text-sm text-purple-200 space-y-2">
        {response.success ? (
          <div>
            <p className="text-green-400 font-semibold text-base">🎉 {response.msg}</p>
            <p className="text-cyan-300 mt-1">Total Test Cases: {response.totalTestCases}</p>
          </div>
        ) : (
          <>
            <p className="text-red-400 font-semibold">{response.msg}</p>
            
            {response.testcase && (
              <div className="bg-black/60 border border-purple-500/50 p-3 rounded-md space-y-1 mt-2">
                <p><span className="text-cyan-300 font-semibold">Failed Test Case:</span> #{response.failedTestCase}</p>
                <p><span className="text-cyan-300 font-semibold">Input:</span> {response.testcase}</p>
                <p><span className="text-cyan-300 font-semibold">Expected:</span> {response.expected}</p>
                <p><span className="text-cyan-300 font-semibold">Received:</span> {response.received}</p>
              </div>
            )}

            {errDetail && (
              <div className="bg-black/80 border border-red-500/60 p-3 rounded-md mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap font-mono text-xs text-red-300 shadow-inner">
                <p className="text-cyan-300 font-semibold mb-1 uppercase tracking-wider">Error Details:</p>
                {errDetail}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RunTestCasesResultModule;
