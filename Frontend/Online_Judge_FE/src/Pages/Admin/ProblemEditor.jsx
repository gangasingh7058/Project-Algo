import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import Editor from "@monaco-editor/react";
import {
  AlertCircle, ArrowLeft, Check, CheckCircle2, ChevronDown, Copy, ExternalLink, FlaskConical, Plus, Trash2, XCircle,
} from "lucide-react";
import TagInput from "../../Components/Admin/TagInput";
import { DifficultyBadge, Segmented, Skeleton, Spinner, Tag } from "../../Components/ui";
import { adminApi, apiError } from "../../Helping Functions/admin";
import { LANGUAGES, defineEditorThemes, editorOptions, toMonacoLanguage } from "../../Helping Functions/editor";
import { snappy, spring } from "../../Helping Functions/motion";
import toast from "../../Helping Functions/toast";

let uid = 0;
const newCase = (input = "", output = "") => ({ key: ++uid, input, output });

const EMPTY = {
  title: "",
  difficulty: "Easy",
  description: "",
  inputtype: "",
  constraints: "",
  tags: [],
  testCases: [newCase()],
};

// Same rules as the server, so mistakes show up inline before saving
const validate = (p) => {
  const e = {};
  if (!p.title.trim()) e.title = "Give the problem a title";
  if (!p.description.trim()) e.description = "Describe the problem";
  if (p.testCases.length === 0) e.testCases = "Add at least one test case";
  else if (p.testCases.some((t) => !t.output.trim())) e.testCases = "Every test case needs an expected output";
  return e;
};

const FieldError = ({ message, id }) => (
  <AnimatePresence initial={false}>
    {message && (
      <motion.p
        id={id}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={snappy}
        className="flex items-center gap-1.5 overflow-hidden pt-1.5 text-[0.8125rem] text-danger"
      >
        <AlertCircle size={14} className="shrink-0" /> {message}
      </motion.p>
    )}
  </AnimatePresence>
);

const Section = ({ title, subtitle, children, action }) => (
  <section className="card p-5 sm:p-6">
    <div className="mb-5 flex items-start justify-between gap-3">
      <div>
        <h2 className="title text-lg">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[0.8125rem] text-label-2">{subtitle}</p>}
      </div>
      {action}
    </div>
    <div className="space-y-5">{children}</div>
  </section>
);

const TextArea = ({ id, label, hint, error, mono, rows = 4, ...props }) => (
  <div>
    <label htmlFor={id} className="label">{label}</label>
    <textarea
      id={id}
      rows={rows}
      spellCheck={!mono}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      className={`field resize-y ${mono ? "font-mono text-sm" : "text-[0.9375rem]"} ${error ? "!border-danger" : ""}`}
      {...props}
    />
    {hint && !error && <p className="pt-1.5 text-xs text-label-3">{hint}</p>}
    <FieldError id={`${id}-error`} message={error} />
  </div>
);

// Mirrors the public problem page, so admins see exactly what solvers will see
const Preview = ({ p }) => (
  <div className="card max-h-[calc(100dvh-9rem)] overflow-y-auto p-6">
    <p className="eyebrow mb-4">Preview</p>
    <h1 className="display text-[1.6rem] leading-tight">{p.title || <span className="text-label-3">Untitled problem</span>}</h1>
    <div className="mt-3 flex flex-wrap gap-2">
      <DifficultyBadge level={p.difficulty} />
      {p.tags.map((t) => <Tag key={t}>{t}</Tag>)}
    </div>
    <div className="mt-5 whitespace-pre-line text-[0.9375rem] leading-[1.7] text-label/90">
      {p.description || <span className="text-label-3">The description will appear here.</span>}
    </div>
    <p className="eyebrow mb-2 mt-6">Input format</p>
    <p className="whitespace-pre-line text-[0.9375rem] leading-[1.7] text-label/90">{p.inputtype || "No input details provided."}</p>
    <p className="eyebrow mb-2 mt-6">Constraints</p>
    <pre className="whitespace-pre-wrap rounded-xl bg-fill px-3.5 py-2.5 font-mono text-[0.8125rem]">{p.constraints || "None"}</pre>
    {p.testCases.length > 0 && (
      <>
        <p className="eyebrow mb-2 mt-6">Examples</p>
        <div className="space-y-4">
          {p.testCases.slice(0, 2).map((t, i) => (
            <div key={t.key}>
              <p className="mb-1.5 text-sm font-semibold">Example {i + 1}</p>
              <div className="grid grid-cols-2 gap-2">
                <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl bg-fill px-3 py-2 font-mono text-[0.8125rem]">{t.input || " "}</pre>
                <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl bg-fill px-3 py-2 font-mono text-[0.8125rem]">{t.output || " "}</pre>
              </div>
            </div>
          ))}
        </div>
      </>
    )}
  </div>
);

const ProblemEditor = () => {
  const { pid } = useParams();
  const isNew = !pid || pid === "new";
  const navigate = useNavigate();

  const [problem, setProblem] = useState(isNew ? EMPTY : null);
  const [loadError, setLoadError] = useState("");
  const [tags, setTags] = useState([]);
  const [errors, setErrors] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState("edit"); // small screens: edit | preview
  const initial = useRef(JSON.stringify(EMPTY));

  // Reference solution checker
  const [refOpen, setRefOpen] = useState(false);
  const [refLang, setRefLang] = useState("cpp");
  const [refCode, setRefCode] = useState("");
  const [results, setResults] = useState({}); // key → { status, output }
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    adminApi().get("/tags").then((r) => setTags(r.data.tags)).catch(() => {});
  }, []);

  useEffect(() => {
    if (isNew) return;
    adminApi()
      .get(`/problems/${pid}`)
      .then((r) => {
        const p = r.data.problem;
        const loaded = { ...p, testCases: p.testCases.map((t) => newCase(t.input, t.output)) };
        initial.current = JSON.stringify({ ...loaded, testCases: loaded.testCases.map(({ input, output }) => ({ input, output })) });
        setProblem(loaded);
      })
      .catch((e) => setLoadError(apiError(e, "Couldn't load this problem")));
  }, [pid, isNew]);

  const snapshot = problem && JSON.stringify({ ...problem, testCases: problem.testCases.map(({ input, output }) => ({ input, output })) });
  const dirty = !!problem && snapshot !== initial.current;

  // Warn before losing unsaved work on reload / tab close
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const set = (field) => (value) => {
    setProblem((p) => {
      const next = { ...p, [field]: value };
      if (attempted) setErrors(validate(next));
      return next;
    });
  };

  const updateCase = (key, field, value) =>
    set("testCases")(problem.testCases.map((t) => (t.key === key ? { ...t, [field]: value } : t)));

  const removeCase = (key) => set("testCases")(problem.testCases.filter((t) => t.key !== key));
  const duplicateCase = (t) => set("testCases")([...problem.testCases, newCase(t.input, t.output)]);

  const addCase = () => {
    const c = newCase();
    set("testCases")([...problem.testCases, c]);
    requestAnimationFrame(() => document.getElementById(`tc-in-${c.key}`)?.focus());
  };

  const runReference = async () => {
    if (!refCode.trim()) return toast.warning("Paste a reference solution first");
    setChecking(true);
    setResults({});
    for (const t of problem.testCases) {
      setResults((r) => ({ ...r, [t.key]: { status: "running" } }));
      try {
        const res = await axios.post(`${import.meta.env.VITE_COMPILER_PORT}/run`, {
          language: refLang, code: refCode, inputs: t.input, mode: "compiler",
        });
        if (!res.data.success) {
          setResults((r) => ({ ...r, [t.key]: { status: "error", output: res.data.error || res.data.err || "Error" } }));
          continue;
        }
        const out = String(res.data.verdict ?? "");
        const status = !t.output.trim() ? "empty" : out.trim() === t.output.trim() ? "pass" : "fail";
        setResults((r) => ({ ...r, [t.key]: { status, output: out } }));
      } catch (e) {
        setResults((r) => ({ ...r, [t.key]: { status: "error", output: e.response ? "Server error" : "Compiler not responding" } }));
      }
    }
    setChecking(false);
  };

  const fillEmptyOutputs = () =>
    set("testCases")(
      problem.testCases.map((t) =>
        !t.output.trim() && results[t.key]?.output !== undefined && results[t.key].status === "empty"
          ? { ...t, output: results[t.key].output.trim() }
          : t
      )
    );

  const save = async () => {
    setAttempted(true);
    const e = validate(problem);
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error("Please fix the highlighted fields");
      document.querySelector("[aria-invalid='true'], [data-error='true']")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSaving(true);
    const body = { ...problem, testCases: problem.testCases.map(({ input, output }) => ({ input, output })) };
    try {
      const api = adminApi();
      if (isNew) await api.post("/problems", body);
      else await api.put(`/problems/${pid}`, body);
      initial.current = snapshot;
      toast.success(isNew ? "Problem published" : "Changes saved");
      navigate("/admin/problems");
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      toast.error(apiError(err, "Couldn't save the problem"));
    } finally {
      setSaving(false);
    }
  };

  const summary = useMemo(() => {
    const vals = Object.values(results);
    return {
      pass: vals.filter((r) => r.status === "pass").length,
      fail: vals.filter((r) => r.status === "fail" || r.status === "error").length,
      empty: vals.filter((r) => r.status === "empty").length,
    };
  }, [results]);

  if (loadError) {
    return (
      <div className="card mx-auto mt-14 flex max-w-md flex-col items-center gap-2 px-6 py-14 text-center">
        <p className="title text-lg">Couldn't open this problem</p>
        <p className="text-sm text-label-2">{loadError}</p>
        <Link to="/admin/problems" className="btn btn-secondary btn-sm mt-3"><ArrowLeft size={14} /> All problems</Link>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="space-y-6 pt-10">
        <Skeleton className="h-10 w-72 rounded-lg" />
        <Skeleton className="h-64 w-full rounded-[1.25rem]" />
        <Skeleton className="h-64 w-full rounded-[1.25rem]" />
      </div>
    );
  }

  return (
    <div>
      {/* Header with the primary action, pinned under the nav while editing */}
      <div className="glass sticky top-[4.25rem] z-30 mb-6 mt-4 rounded-2xl border border-hairline px-3 py-2.5 shadow-xl shadow-black/40 sm:px-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/admin/problems" className="btn btn-ghost btn-icon" aria-label="Back to problems">
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="eyebrow">{isNew ? "New problem" : "Edit problem"}</p>
            <p className="title truncate text-lg">{problem.title || "Untitled problem"}</p>
          </div>
          <div className="lg:hidden">
            <Segmented size="sm" label="Editor view" value={view} onChange={setView}
              options={[{ value: "edit", label: "Edit" }, { value: "preview", label: "Preview" }]} />
          </div>
          {dirty && <span className="hidden text-[0.8125rem] text-label-3 sm:inline">Unsaved changes</span>}
          {!isNew && (
            <a href={`/home/problem/${pid}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
              <ExternalLink size={14} /> <span className="hidden sm:inline">View live</span>
            </a>
          )}
          <button onClick={save} disabled={saving || (!isNew && !dirty)} className="btn btn-primary btn-sm">
            {saving ? <><Spinner className="h-3.5 w-3.5" /> Saving…</> : isNew ? "Publish" : "Save changes"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className={`space-y-6 ${view === "preview" ? "hidden lg:block" : ""}`}>
          <Section title="Details">
            <div>
              <label htmlFor="title" className="label">Title</label>
              <input
                id="title"
                className={`field ${errors.title ? "!border-danger" : ""}`}
                value={problem.title}
                onChange={(e) => set("title")(e.target.value)}
                placeholder="e.g. Two Sum"
                aria-invalid={!!errors.title}
                autoFocus={isNew}
              />
              <FieldError message={errors.title} />
            </div>
            <div>
              <p className="label" id="difficulty-label">Difficulty</p>
              <Segmented
                label="Difficulty"
                value={problem.difficulty}
                onChange={set("difficulty")}
                options={["Easy", "Medium", "Hard"].map((d) => ({ value: d, label: d }))}
              />
            </div>
            <div>
              <label htmlFor="tags" className="label">Topics</label>
              <TagInput id="tags" value={problem.tags} onChange={set("tags")} suggestions={tags} />
              <p className="pt-1.5 text-xs text-label-3">Press Enter to add. Existing topics are suggested so they aren't duplicated.</p>
            </div>
          </Section>

          <Section title="Statement">
            <TextArea
              id="description"
              label="Description"
              rows={8}
              value={problem.description}
              onChange={(e) => set("description")(e.target.value)}
              placeholder="Explain the task. Line breaks are kept."
              error={errors.description}
            />
            <TextArea
              id="inputtype"
              label="Input format"
              rows={3}
              value={problem.inputtype}
              onChange={(e) => set("inputtype")(e.target.value)}
              placeholder="e.g. The first line contains n, followed by n integers."
            />
            <TextArea
              id="constraints"
              label="Constraints"
              rows={3}
              mono
              value={problem.constraints}
              onChange={(e) => set("constraints")(e.target.value)}
              placeholder={"1 <= n <= 10^5\n-10^9 <= a[i] <= 10^9"}
            />
          </Section>

          <Section
            title="Test cases"
            subtitle="Submissions must match every expected output (whitespace at the ends is ignored). Two of them are shown on the problem page as examples."
          >
            <div data-error={!!errors.testCases}>
              <ul className="space-y-3">
                <AnimatePresence initial={false}>
                  {problem.testCases.map((t, i) => {
                    const r = results[t.key];
                    return (
                      <motion.li
                        key={t.key}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={spring}
                        className="overflow-hidden"
                      >
                        <div className="rounded-2xl bg-fill p-3.5">
                          <div className="mb-2.5 flex items-center justify-between gap-2">
                            <p className="flex items-center gap-2 text-sm font-semibold">
                              Test case {i + 1}
                              {r?.status === "pass" && <span className="flex items-center gap-1 text-xs font-medium text-success"><CheckCircle2 size={14} /> Matches</span>}
                              {r?.status === "fail" && <span className="flex items-center gap-1 text-xs font-medium text-danger"><XCircle size={14} /> Mismatch</span>}
                              {r?.status === "error" && <span className="flex items-center gap-1 text-xs font-medium text-danger"><XCircle size={14} /> Error</span>}
                              {r?.status === "running" && <Spinner className="h-3.5 w-3.5 text-label-3" />}
                            </p>
                            <div className="flex items-center">
                              <button type="button" className="btn btn-ghost btn-icon h-8 w-8" aria-label={`Duplicate test case ${i + 1}`} onClick={() => duplicateCase(t)}>
                                <Copy size={14} />
                              </button>
                              <button type="button" className="btn btn-ghost btn-icon h-8 w-8 hover:!text-danger" aria-label={`Delete test case ${i + 1}`} onClick={() => removeCase(t.key)} disabled={problem.testCases.length === 1}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="grid gap-2.5 sm:grid-cols-2">
                            <div>
                              <label htmlFor={`tc-in-${t.key}`} className="mb-1 block text-xs font-medium text-label-3">Input</label>
                              <textarea id={`tc-in-${t.key}`} rows={3} spellCheck={false} value={t.input}
                                onChange={(e) => updateCase(t.key, "input", e.target.value)}
                                className="field resize-y bg-surface font-mono text-sm hover:bg-surface" placeholder="stdin" />
                            </div>
                            <div>
                              <label htmlFor={`tc-out-${t.key}`} className="mb-1 block text-xs font-medium text-label-3">Expected output</label>
                              <textarea id={`tc-out-${t.key}`} rows={3} spellCheck={false} value={t.output}
                                onChange={(e) => updateCase(t.key, "output", e.target.value)}
                                aria-invalid={attempted && !t.output.trim()}
                                className={`field resize-y bg-surface font-mono text-sm hover:bg-surface ${attempted && !t.output.trim() ? "!border-danger" : ""}`}
                                placeholder="stdout" />
                            </div>
                          </div>
                          {r && (r.status === "fail" || r.status === "error" || r.status === "empty") && (
                            <div className="mt-2.5 rounded-xl bg-surface px-3 py-2">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-medium text-label-3">Reference output</p>
                                {r.status !== "error" && (
                                  <button type="button" className="btn btn-ghost btn-sm h-7 text-xs" onClick={() => updateCase(t.key, "output", r.output.trim())}>
                                    <Check size={13} /> Use as expected
                                  </button>
                                )}
                              </div>
                              <pre className={`mt-1 max-h-32 overflow-auto whitespace-pre-wrap font-mono text-[0.8125rem] ${r.status === "error" ? "text-danger" : "text-label"}`}>{r.output || " "}</pre>
                            </div>
                          )}
                        </div>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
              <FieldError message={errors.testCases} />
              <button type="button" onClick={addCase} className="btn btn-secondary btn-sm mt-3">
                <Plus size={15} /> Add test case
              </button>
            </div>
          </Section>

          {/* Optional: run a known-good solution over the test cases to catch wrong expected outputs */}
          <section className="card overflow-hidden">
            <button
              type="button"
              onClick={() => setRefOpen((o) => !o)}
              aria-expanded={refOpen}
              className="flex w-full items-center gap-3 p-5 text-left hover:bg-fill sm:p-6"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent"><FlaskConical size={18} /></span>
              <span className="flex-1">
                <span className="title block text-lg">Check with a reference solution</span>
                <span className="block text-[0.8125rem] text-label-2">Optional. Runs your solution on every test case and compares outputs.</span>
              </span>
              <motion.span animate={{ rotate: refOpen ? 180 : 0 }} transition={spring} className="text-label-3"><ChevronDown size={18} /></motion.span>
            </button>
            <AnimatePresence initial={false}>
              {refOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={spring}
                  className="overflow-hidden"
                >
                  <div className="border-t border-hairline">
                    <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                      <label className="sr-only" htmlFor="ref-language">Language</label>
                      <select id="ref-language" className="field field-sm w-36" value={refLang} onChange={(e) => setRefLang(e.target.value)}>
                        {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                      </select>
                      <div className="flex items-center gap-2">
                        {summary.empty > 0 && !checking && (
                          <button type="button" className="btn btn-ghost btn-sm" onClick={fillEmptyOutputs}>Fill {summary.empty} empty</button>
                        )}
                        <button type="button" className="btn btn-secondary btn-sm" onClick={runReference} disabled={checking}>
                          {checking ? <><Spinner className="h-3.5 w-3.5" /> Checking…</> : <><FlaskConical size={14} /> Run on all cases</>}
                        </button>
                      </div>
                    </div>
                    <div className="h-72 border-t border-hairline">
                      <Editor
                        height="100%"
                        theme="midnight"
                        language={toMonacoLanguage(refLang)}
                        value={refCode}
                        onChange={(v) => setRefCode(v || "")}
                        beforeMount={defineEditorThemes}
                        loading={<Skeleton className="m-4 h-[calc(100%-2rem)]" />}
                        options={editorOptions(14)}
                      />
                    </div>
                    {Object.keys(results).length > 0 && !checking && (
                      <p className="border-t border-hairline px-5 py-3 text-[0.8125rem] text-label-2" role="status">
                        <span className="text-success">{summary.pass} matching</span>
                        {summary.fail > 0 && <> · <span className="text-danger">{summary.fail} mismatched</span></>}
                        {summary.empty > 0 && <> · {summary.empty} without an expected output</>}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        <aside className={`lg:sticky lg:top-36 lg:self-start ${view === "edit" ? "hidden lg:block" : ""}`}>
          <Preview p={problem} />
        </aside>
      </div>
    </div>
  );
};

export default ProblemEditor;
