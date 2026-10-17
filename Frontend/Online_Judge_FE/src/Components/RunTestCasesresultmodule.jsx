import { motion } from 'framer-motion';
import { X, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { spring } from '../Helping Functions/motion';

const Row = ({ label, children }) => (
  <div className="grid grid-cols-[5.5rem_1fr] gap-3 py-2 text-sm">
    <dt className="text-label-3">{label}</dt>
    <dd className="min-w-0 whitespace-pre-wrap break-words font-mono text-[0.8125rem] text-label">{children}</dd>
  </div>
);

// Inline, non-blocking result card — sits in the flow instead of covering the editor
const RunTestCasesResultModule = ({ response, setshowresultmodule }) => {
  if (!response) return null;

  const isCompilationError = response.errorcode === 3 || response.msg === "Compilation Failed";
  const errDetail = response.err || response.error;

  const tone = response.success
    ? { Icon: CheckCircle2, color: 'text-success', bg: 'bg-success/12', title: 'All test cases passed' }
    : isCompilationError
      ? { Icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/12', title: 'Compilation error' }
      : { Icon: XCircle, color: 'text-danger', bg: 'bg-danger/12', title: 'Test case failed' };

  return (
    <motion.section
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={spring}
      className="overflow-hidden"
      aria-live="polite"
    >
      <div className="card p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={`grid h-9 w-9 place-items-center rounded-full ${tone.bg} ${tone.color}`}>
              <tone.Icon size={20} />
            </span>
            <div>
              <h2 className="title text-base">{tone.title}</h2>
              <p className="text-[0.8125rem] text-label-2">
                {response.success
                  ? `${response.totalTestCases ?? 'All'} test cases · ready to submit`
                  : response.msg}
              </p>
            </div>
          </div>
          <button aria-label="Close results" onClick={() => setshowresultmodule(false)} className="btn btn-ghost btn-icon h-8 w-8">
            <X size={16} />
          </button>
        </div>

        {!response.success && response.testcase && (
          <dl className="mt-4 divide-y divide-hairline rounded-xl bg-fill px-3.5">
            <Row label="Test case">#{response.failedTestCase}</Row>
            <Row label="Input">{response.testcase}</Row>
            <Row label="Expected">{response.expected}</Row>
            <Row label="Received"><span className="text-danger">{response.received}</span></Row>
          </dl>
        )}

        {!response.success && errDetail && (
          <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-xl bg-danger/8 p-3.5 font-mono text-xs leading-relaxed text-danger">
            {errDetail}
          </pre>
        )}
      </div>
    </motion.section>
  );
};

export default RunTestCasesResultModule;
