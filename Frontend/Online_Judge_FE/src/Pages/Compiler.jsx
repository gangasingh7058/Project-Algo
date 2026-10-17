import { useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { Play } from 'lucide-react';
import toast from '../Helping Functions/toast';
import { EditorSettings, ModKey, Page, PageHeader, Skeleton, Spinner } from '../Components/ui';
import { LANGUAGES, defineEditorThemes, editorOptions, toMonacoLanguage } from '../Helping Functions/editor';

const COMPILER_TEMPLATES = {
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    if (cin >> a >> b) {\n        cout << a + b;\n    }\n    return 0;\n}`,
  python: `a, b = map(int, input().split())\nprint(a + b)`,
  javascript: `import fs from 'fs';\nconst input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\nif (input.length >= 2) {\n    const a = parseInt(input[0], 10);\n    const b = parseInt(input[1], 10);\n    console.log(a + b);\n}`
};

const CompilerPage = () => {
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState(COMPILER_TEMPLATES.cpp);
  const [inputs, setInputs] = useState('');
  const [output, setOutput] = useState('');
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fontSize, setFontSize] = useState(15);
  const [theme, setTheme] = useState('midnight');
  const runRef = useRef(null);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const isStandardCode = Object.values(COMPILER_TEMPLATES).some(template => template.trim() === code.trim());
    if (isStandardCode && COMPILER_TEMPLATES[newLang]) {
      setCode(COMPILER_TEMPLATES[newLang]);
    }
  };

  const handleRun = async () => {
    if (loading) return;
    const requiresInput =
      (code.includes('cin') || code.includes('input()') || code.includes('readFileSync') || code.includes('Scanner')) &&
      inputs.trim() === '';

    if (requiresInput) {
      toast.warning("Inputs Required for Given Code");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_COMPILER_PORT}/run`, {
        language: language,
        code: code,
        inputs: inputs,
        mode: 'compiler',
      });

      if (res.data.success) {
        setOutput(res.data.verdict);
        setFailed(false);
      } else {
        setOutput(res.data.error || res.data.err || "Error");
        setFailed(true);
      }
    } catch (err) {
      // No response at all means the compiler service is down or still waking up
      setOutput(err.response ? "Server error" : "Compiler not responding. It may be waking up — try again in a few seconds.");
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };
  runRef.current = handleRun;

  return (
    <Page className="pb-16">
      <PageHeader eyebrow="Playground" title="Compiler" subtitle="Write, run and experiment in C++, Python or JavaScript." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Editor */}
        <section className="card overflow-hidden lg:col-span-3" aria-label="Code editor">
          <div className="flex items-center justify-between gap-3 border-b border-hairline px-3 py-2.5">
            <label className="sr-only" htmlFor="compiler-language">Language</label>
            <select
              id="compiler-language"
              className="field field-sm w-36"
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
            >
              {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
            <EditorSettings fontSize={fontSize} setFontSize={setFontSize} theme={theme} setTheme={setTheme} />
          </div>

          <div className="h-[clamp(360px,60vh,620px)]">
            <Editor
              height="100%"
              language={toMonacoLanguage(language)}
              value={code}
              theme={theme}
              beforeMount={defineEditorThemes}
              onMount={(editor, monaco) => {
                editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => runRef.current());
              }}
              loading={<Skeleton className="m-4 h-[calc(100%-2rem)] rounded-xl" />}
              onChange={(value) => setCode(value || '')}
              options={editorOptions(fontSize)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-hairline px-3 py-2.5">
            <span className="hidden text-xs text-label-3 sm:inline">Run with <ModKey /></span>
            <button onClick={handleRun} disabled={loading} className="btn btn-primary">
              {loading ? <><Spinner /> Running…</> : <><Play size={15} fill="currentColor" /> Run</>}
            </button>
          </div>
        </section>

        {/* I/O */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <section className="card flex flex-col p-4">
            <label htmlFor="compiler-input" className="title px-1 pb-3 text-[0.9375rem]">Input</label>
            <textarea
              id="compiler-input"
              rows={6}
              spellCheck={false}
              value={inputs}
              onChange={(e) => setInputs(e.target.value)}
              placeholder="Standard input for your program"
              className="field resize-y font-mono text-sm"
            />
          </section>

          <section className="card flex flex-1 flex-col p-4" aria-live="polite">
            <div className="flex items-center justify-between px-1 pb-3">
              <h2 className="title text-[0.9375rem]">Output</h2>
              {output && !loading && (
                <span className={`text-xs font-medium ${failed ? 'text-danger' : 'text-success'}`}>
                  {failed ? 'Error' : 'Finished'}
                </span>
              )}
            </div>
            <pre
              className={`min-h-[10rem] flex-1 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-fill p-3.5 font-mono text-sm leading-relaxed ${
                failed ? 'text-danger' : output ? 'text-label' : 'text-label-3'
              } ${loading ? 'opacity-50' : ''} transition-opacity`}
            >
              {output || 'Output will appear here.'}
            </pre>
          </section>
        </div>
      </div>
    </Page>
  );
};

export default CompilerPage;
