import Editor from '@monaco-editor/react';
import { useRef, useState } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { Copy, FlaskConical, Keyboard, Lightbulb, Play, Send, Sparkles, Terminal, Trash2, Undo2, X } from 'lucide-react';
import RunTestCasesResultModule from './RunTestCasesresultmodule';
import getusertoken from '../Helping Functions/getusertoken';
import toast from '../Helping Functions/toast';
import { EditorSettings, ModKey, Segmented, Skeleton, Spinner } from './ui';
import { snappy } from '../Helping Functions/motion';
import { LANGUAGES, asComment, defineEditorThemes, editorOptions, toMonacoLanguage } from '../Helping Functions/editor';

const CODE_TEMPLATES = {
  cpp: `#include<iostream>\nusing namespace std;\n\nint main(){\n cout<<"Hello World"<<endl;\n\nreturn 0;\n}`,
  python: `print("Hello World")`,
  javascript: `console.log("Hello World");`
};

const apiError = (error, fallback) =>
  error.response?.data?.msg || error.response?.data?.err || error.response?.data?.error || error.message || fallback;

const ProblemSolveCodeArea = ({ problemId }) => {
  const [code, setcode] = useState(CODE_TEMPLATES.cpp);
  const [fontsize, setfontsize] = useState(15);
  const [theme, settheme] = useState('midnight');
  const [codeinput, setcodeinput] = useState('');
  const [codeoutput, setcodeoutput] = useState('');
  const [outputFailed, setOutputFailed] = useState(false);
  const [active, setactive] = useState('input');
  const [language, setlanguage] = useState('cpp');
  const [runloading, setrunloading] = useState(false);
  const [runTestCaseloading, setrunTestcaseloading] = useState(false);
  const [submitloading, setsubmitloading] = useState(false);
  const [showresultmodule, setshowresultmodule] = useState(false);
  const [runteastcaseresponse, setruntestcaseresponse] = useState(null);
  const [askailoading, setaskailoading] = useState(false);
  const [gethintloading, setgethintloadinh] = useState(false);
  const [gothint, setgothint] = useState(false);
  const [aiUndo, setAiUndo] = useState(null); // code as it was before the AI rewrote it
  const runRef = useRef(null);

  const handleLanguageChange = (newLang) => {
    setlanguage(newLang);
    // If the current code matches one of the standard templates, automatically load default code for new language
    const isStandardCode = Object.values(CODE_TEMPLATES).some(template => template.trim() === code.trim());
    if (isStandardCode && CODE_TEMPLATES[newLang]) {
      setcode(CODE_TEMPLATES[newLang]);
    }
  };

  const handleRun = async () => {
    if (runloading) return;
    const requiresInput =
      (code.includes('cin') || code.includes('input()') || code.includes('readFileSync') || code.includes('Scanner')) &&
      codeinput.trim() === '';

    if (requiresInput) {
      setactive('input');
      toast.warning('Inputs Required for Given Code');
      return;
    }

    setrunloading(true);
    setactive('output');
    try {
      const res = await axios.post(`${import.meta.env.VITE_COMPILER_PORT}/run`, {
        language: language,
        code: code,
        inputs: codeinput,
        mode: 'compiler'
      });

      if (res.data.success) {
        setcodeoutput(res.data.verdict);
        setOutputFailed(false);
      } else {
        setcodeoutput(res.data.error || res.data.err || "Compilation Error");
        setOutputFailed(true);
      }
    } catch (error) {
      setcodeoutput(error.response ? 'Server error' : 'Compiler not responding. It may be waking up — try again in a few seconds.');
      setOutputFailed(true);
    } finally {
      setrunloading(false);
    }
  };
  runRef.current = handleRun;

  const handleRunTest = async () => {
    setrunTestcaseloading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_PORT}/evaluate/run/${problemId}`, {
        code: code,
        language: language
      });

      if (response.data.received && response.data.received.length > 1000) {
        response.data.received = "Undefined";
      }
      setruntestcaseresponse(response.data);
    } catch (error) {
      toast.error(apiError(error, "Some Error Occured While Running Test Cases"));
    } finally {
      setrunTestcaseloading(false);
      setshowresultmodule(true);
    }
  };

  const handleSubmit = async () => {
    let token = getusertoken();
    if (token == null) {
      toast.warning("SignIn To Submit");
      return;
    }
    token = token.split(" ")[1];

    if (runteastcaseresponse == null) {
      toast.warning("Run Test Cases First");
      return;
    }
    if (runteastcaseresponse.success == false) {
      toast.warning("All Test Cases not passed");
      return;
    }

    setsubmitloading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_PORT}/evaluate/submit/${problemId}`, {
        code,
        language,
        usertoken: token
      });
      (response.data.success ? toast.success : toast.error)(response.data.msg);
    } catch (error) {
      toast.error(apiError(error, "Error Submitting"));
    } finally {
      setsubmitloading(false);
    }
  };

  const handleAskAi = async () => {
    if (!runteastcaseresponse) {
      return toast.warning("Try Testcases First");
    }
    if (runteastcaseresponse.success == true) {
      return toast.success("Your Code Already Passes All Test Cases");
    }

    try {
      setaskailoading(true);
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_PORT}/ai/find_error`, {
        code,
        pid: problemId
      });

      if (response.data.success == false || !response.data.res) {
        toast.error(response.data.msg || "AI could not suggest a fix");
        return;
      }
      // Keep the user's version so the rewrite can be undone
      setAiUndo(code);
      setcode(response.data.res);
    } catch (error) {
      toast.error(apiError(error, "Some Error Occured"));
    } finally {
      setaskailoading(false);
    }
  };

  const handleGetHint = async () => {
    if (gothint) {
      return toast.info("Hint Already Used");
    }

    try {
      setgethintloadinh(true);
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_PORT}/ai/gethint`, {
        pid: problemId
      });

      if (!response.data.success) {
        toast.error(response.data.msg);
      } else {
        setcode(code + asComment(response.data.res, language));
        setgothint(true);
        toast.info("Hint added at the end of your code");
      }
    } catch (error) {
      toast.error(apiError(error, "Error getting Hints"));
    } finally {
      setgethintloadinh(false);
    }
  };

  const testsFailed = runteastcaseresponse && runteastcaseresponse.success === false;
  const consoleValue = active === 'input' ? codeinput : codeoutput;

  return (
    <div className="space-y-4">
      {/* Editor */}
      <section className="card overflow-hidden" aria-label="Code editor">
        <div className="flex items-center justify-between gap-3 border-b border-hairline px-3 py-2.5">
          <label className="sr-only" htmlFor="solve-language">Language</label>
          <select
            id="solve-language"
            className="field field-sm w-36"
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
          >
            {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
          <EditorSettings fontSize={fontsize} setFontSize={setfontsize} theme={theme} setTheme={settheme} />
        </div>

        <AnimatePresence initial={false}>
          {aiUndo !== null && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={snappy}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 border-b border-hairline bg-ai/10 px-4 py-2.5 text-sm">
                <Sparkles size={16} className="shrink-0 text-ai" />
                <p className="flex-1 text-label">AI rewrote your code with a suggested fix.</p>
                <button className="btn btn-secondary btn-sm" onClick={() => { setcode(aiUndo); setAiUndo(null); }}>
                  <Undo2 size={14} /> Undo
                </button>
                <button className="btn btn-ghost btn-icon h-8 w-8" aria-label="Keep AI changes" onClick={() => setAiUndo(null)}>
                  <X size={15} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-[clamp(320px,52vh,600px)]">
          <Editor
            height="100%"
            theme={theme}
            language={toMonacoLanguage(language)}
            value={code}
            beforeMount={defineEditorThemes}
            onMount={(editor, monaco) => {
              editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => runRef.current());
            }}
            loading={<Skeleton className="m-4 h-[calc(100%-2rem)] rounded-xl" />}
            onChange={(value) => { setcode(value || ''); setruntestcaseresponse(null); }}
            options={editorOptions(fontsize)}
          />
        </div>

        {/* Actions: assistive tools on the left, the run → test → submit flow on the right */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-hairline px-3 py-2.5">
          <div className="flex items-center gap-1">
            <button disabled={gethintloading || gothint} onClick={handleGetHint} className="btn btn-ghost btn-sm" title={gothint ? 'Hint already used' : 'Get a hint'}>
              {gethintloading ? <Spinner className="h-3.5 w-3.5" /> : <Lightbulb size={15} className="text-hint" />}
              {gothint ? 'Hint used' : 'Hint'}
            </button>
            <AnimatePresence initial={false}>
              {testsFailed && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={snappy}
                  disabled={askailoading}
                  onClick={handleAskAi}
                  className="btn btn-ghost btn-sm"
                >
                  {askailoading ? <Spinner className="h-3.5 w-3.5" /> : <Sparkles size={15} className="text-ai" />}
                  {askailoading ? 'Thinking…' : 'Fix with AI'}
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2">
            <button disabled={runloading} onClick={handleRun} className="btn btn-secondary btn-sm" title="Run with custom input">
              {runloading ? <Spinner className="h-3.5 w-3.5" /> : <Play size={14} fill="currentColor" />}
              Run
              <span className="hidden lg:inline"><ModKey /></span>
            </button>
            <button disabled={runTestCaseloading} onClick={handleRunTest} className="btn btn-secondary btn-sm">
              {runTestCaseloading ? <Spinner className="h-3.5 w-3.5" /> : <FlaskConical size={15} />}
              {runTestCaseloading ? 'Testing…' : 'Run tests'}
            </button>
            <button disabled={submitloading} onClick={handleSubmit} className="btn btn-primary btn-sm">
              {submitloading ? <Spinner className="h-3.5 w-3.5" /> : <Send size={14} />}
              {submitloading ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </div>
      </section>

      {/* Test results slot in between editor and console without covering anything */}
      <AnimatePresence initial={false}>
        {showresultmodule && runteastcaseresponse && (
          <RunTestCasesResultModule key="results" response={runteastcaseresponse} setshowresultmodule={setshowresultmodule} />
        )}
      </AnimatePresence>

      {/* Console: Input / Output */}
      <section className="card overflow-hidden" aria-label="Console">
        <div className="flex items-center justify-between gap-2 border-b border-hairline px-3 py-2">
          <Segmented
            label="Console"
            size="sm"
            value={active}
            onChange={setactive}
            options={[
              { value: 'input', label: 'Input', Icon: Keyboard },
              { value: 'output', label: 'Output', Icon: Terminal },
            ]}
          />
          <div className="flex items-center gap-0.5">
            <button
              aria-label={`Copy ${active}`}
              className="btn btn-ghost btn-icon h-8 w-8"
              disabled={!consoleValue}
              onClick={() => {
                navigator.clipboard?.writeText(consoleValue)
                  .then(() => toast.success('Copied to clipboard', { duration: 1500 }))
                  .catch(() => toast.error('Could not copy'));
              }}
            >
              <Copy size={15} />
            </button>
            {active === 'input' && (
              <button
                aria-label="Clear input"
                className="btn btn-ghost btn-icon h-8 w-8"
                disabled={!codeinput}
                onClick={() => setcodeinput('')}
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>

        {active === 'input' ? (
          <textarea
            aria-label="Standard input"
            spellCheck={false}
            className="block h-40 w-full resize-y bg-transparent px-4 py-3 font-mono text-sm leading-relaxed text-label placeholder:text-label-3 focus:outline-none"
            value={codeinput}
            onChange={(e) => setcodeinput(e.target.value)}
            placeholder="Custom input (stdin) for Run"
          />
        ) : (
          <pre
            aria-live="polite"
            className={`h-40 overflow-auto whitespace-pre-wrap break-words px-4 py-3 font-mono text-sm leading-relaxed transition-opacity ${
              runloading ? 'opacity-50' : ''
            } ${outputFailed ? 'text-danger' : codeoutput ? 'text-label' : 'text-label-3'}`}
          >
            {runloading ? 'Running…' : codeoutput || 'Output will appear here after you run your code.'}
          </pre>
        )}
      </section>
    </div>
  );
};

export default ProblemSolveCodeArea;
