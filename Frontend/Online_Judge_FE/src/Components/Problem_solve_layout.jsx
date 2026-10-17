import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Copy, FileText, History } from "lucide-react";
import getusertoken from "../Helping Functions/getusertoken";
import PastsubmissionModule from "./pastSubmissionmodule";
import toast from '../Helping Functions/toast';
import { DifficultyBadge, Segmented, Skeleton, Tag } from "./ui";
import { snappy } from "../Helping Functions/motion";

const Section = ({ title, children }) => (
  <section className="mt-7">
    <h2 className="eyebrow mb-2.5">{title}</h2>
    {children}
  </section>
);

const Sample = ({ label, value }) => (
  <div className="group relative">
    <p className="mb-1 text-xs font-medium text-label-3">{label}</p>
    <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl bg-fill px-3.5 py-2.5 pr-10 font-mono text-[0.8125rem] leading-relaxed text-label">
      {value}
    </pre>
    <button
      aria-label={`Copy ${label.toLowerCase()}`}
      className="btn btn-ghost btn-icon absolute bottom-1 right-1 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
      onClick={() =>
        navigator.clipboard?.writeText(value ?? "")
          .then(() => toast.success("Copied to clipboard", { duration: 1500 }))
          .catch(() => toast.error("Could not copy"))
      }
    >
      <Copy size={14} />
    </button>
  </div>
);

const Problem_Solve_Layout = ({ problemId }) => {
  const [problem, setProblem] = useState(null);
  const [pastSubmissions, setPastSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState("problem"); // "problem" or "submissions"
  const [gotproblem, setgotproblem] = useState(null);

  // Get past submissions
  useEffect(() => {
    const getPastSubmissions = async () => {
      const token = getusertoken();
      if (!token) return;

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_PORT}/user/submission/${problemId}`,
          { headers: { usertoken: token } }
        );
        if (response.data.success) {
          setPastSubmissions(response.data.submissions);
        }
      } catch {
        toast.error("Error Fetching Past Submission Data");
      }
    };

    getPastSubmissions();
  }, [problemId]);

  // Get problem details
  useEffect(() => {
    const getProblem = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_PORT}/api/problem/${problemId}`);

        if (response.data.success === false || !response.data.problem) {
          setgotproblem(false);
          return;
        }
        setProblem(response.data.problem);
        setgotproblem(true);
      } catch {
        toast.error("Error Fetching Problem Details");
        setgotproblem(false);
      }
    };

    getProblem();
  }, [problemId]);

  if (gotproblem == null) {
    return (
      <div className="card h-full space-y-4 p-6">
        <Skeleton className="h-8 w-56 rounded-lg" />
        <Skeleton className="h-7 w-2/3" />
        <div className="flex gap-2"><Skeleton className="h-6 w-16 rounded-full" /><Skeleton className="h-6 w-20 rounded-full" /></div>
        <div className="space-y-2.5 pt-4">
          <Skeleton className="h-3.5 w-full" /><Skeleton className="h-3.5 w-11/12" /><Skeleton className="h-3.5 w-4/5" /><Skeleton className="h-3.5 w-3/5" />
        </div>
        <Skeleton className="mt-6 h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (gotproblem == false) {
    return (
      <div className="card flex h-full flex-col items-center justify-center gap-3 p-10 text-center">
        <p className="title text-lg">Couldn't load this problem</p>
        <p className="text-sm text-label-2">It may not exist, or the server is unavailable.</p>
        <Link to="/home" className="btn btn-secondary btn-sm mt-2"><ArrowLeft size={14} /> All problems</Link>
      </div>
    );
  }

  const solved = pastSubmissions.length > 0;

  return (
    <div className="card flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-hairline px-4 py-3">
        <Segmented
          label="Problem view"
          size="sm"
          value={activeTab}
          onChange={setActiveTab}
          options={[
            { value: "problem", label: "Description", Icon: FileText },
            { value: "submissions", label: "Submissions", Icon: History },
          ]}
        />
        <Link to="/home" className="btn btn-ghost btn-sm" aria-label="Back to all problems">
          <ArrowLeft size={14} /> <span className="hidden sm:inline">Problems</span>
        </Link>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ ...snappy, duration: 0.2 }}
            className="px-5 pb-8 pt-6 sm:px-7"
          >
            {activeTab === "problem" ? (
              <article>
                <h1 className="display text-[1.75rem] leading-tight">{problem.title}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <DifficultyBadge level={problem.difficulty} />
                  {solved && (
                    <span className="inline-flex h-6 items-center gap-1 rounded-full bg-success/12 px-2.5 text-xs font-semibold text-success">
                      <CheckCircle2 size={13} /> Solved
                    </span>
                  )}
                  {(problem?.tags || []).map((tagObj, index) => (
                    <Tag key={index}>{tagObj.tag ? tagObj.tag.tagName : tagObj.tagName}</Tag>
                  ))}
                </div>

                <div className="mt-6 whitespace-pre-line text-[0.9375rem] leading-[1.7] text-label/90">
                  {problem.description}
                </div>

                <Section title="Input format">
                  <p className="whitespace-pre-line text-[0.9375rem] leading-[1.7] text-label/90">
                    {problem.inputtype == "" ? "No input details provided." : problem.inputtype}
                  </p>
                </Section>

                <Section title="Constraints">
                  <pre className="whitespace-pre-wrap rounded-xl bg-fill px-3.5 py-2.5 font-mono text-[0.8125rem] leading-relaxed text-label">
                    {problem.constraints == "" ? "None" : problem.constraints}
                  </pre>
                </Section>

                {(problem?.testCases || []).length > 0 && (
                  <Section title="Examples">
                    <div className="space-y-5">
                      {problem.testCases.map((testcase, index) => (
                        <div key={testcase.id || index}>
                          <p className="mb-2 text-sm font-semibold">Example {index + 1}</p>
                          <div className="grid gap-2.5 sm:grid-cols-2">
                            <Sample label="Input" value={testcase.input} />
                            <Sample label="Output" value={testcase.output} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}
              </article>
            ) : (
              <PastsubmissionModule pastSubmissions={pastSubmissions} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Problem_Solve_Layout;
