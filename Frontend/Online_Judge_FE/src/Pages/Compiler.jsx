import { useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import RetroNavbar from '../Components/Navbar';
import toast from '../Helping Functions/toast';

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
  const [loading, setLoading] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState('vs-dark');

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const isStandardCode = Object.values(COMPILER_TEMPLATES).some(template => template.trim() === code.trim());
    if (isStandardCode && COMPILER_TEMPLATES[newLang]) {
      setCode(COMPILER_TEMPLATES[newLang]);
    }
  };

  const handleRun = async () => {
    const requiresInput = 
      (code.includes('cin') || code.includes('input()') || code.includes('readFileSync') || code.includes('Scanner')) && 
      inputs.trim() === '';

    if (requiresInput) {
      toast.warning("Inputs Required for Given Code");
      return;
    }

    let checkifworking = null
    setLoading(true);
    try {
      checkifworking=await axios.get(`${import.meta.env.VITE_COMPILER_PORT}/health`);
      if(!checkifworking.data){
        setOutput("Compiler Not responding");
        return ;
      }

      const res = await axios.post(`${import.meta.env.VITE_COMPILER_PORT}/run`, {
        language: language,
        code: code,
        inputs: inputs,
        mode: 'compiler',
      });

      if (res.data.success) {
        setOutput(res.data.verdict);
      } else {
        setOutput(res.data.error || res.data.err || "Error");
      }
    } catch (err) {
      console.log(checkifworking);
      
      if(checkifworking==null){
        setOutput("Compiler Not Responding")
      }
      else setOutput("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pb-10 text-white relative overflow-hidden">
           
          <RetroNavbar />
          

      {/* Main Content */}
      <div className="relative z-10 px-6 font-mono">
        
        {/* Header Controls */}
        <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
          <h1 className="text-6xl font-bold text-cyan-400 md:pl-30 drop-shadow-[0_0_10px_#22d3ee]">
            Code Compiler
          </h1>

          <div className="flex flex-col md:flex-row gap-y-3 md:gap-y-0 md:gap-x-4">
            <div>
              <label className="mr-2 font-semibold text-white">Language:</label>
              <select
                className="bg-black/50 border border-cyan-400 text-white px-2 py-1 rounded"
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
              >
                <option className="bg-black" value="cpp">C++</option>
                <option className="bg-black" value="python">Python</option>
                <option className="bg-black" value="javascript">JavaScript</option>
              </select>
            </div>
            <div>
              <label className="mr-2 font-semibold text-white">Font Size:</label>
              <select
                className="bg-black/50 border border-cyan-400 text-white px-2 py-1 rounded"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
              >
                {[12, 14, 16, 18, 20].map(size => (
                  <option className="bg-black" key={size} value={size}>
                    {size}px
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mr-2 font-semibold text-white">Theme:</label>
              <select
                className="bg-black/50 border border-cyan-400 text-white px-2 py-1 rounded"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              >
                <option className="bg-black" value="vs-dark">Dark</option>
                <option className="bg-black" value="light">Light</option>
                <option className="bg-black" value="vs">VS</option>
                <option className="bg-black" value="hc-black">High Contrast</option>
              </select>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="rounded-xl overflow-hidden shadow-lg border-2 border-cyan-400/30 bg-black/30 backdrop-blur-md">
            <Editor
              height="500px"
              language={language === 'python' || language === 'py' ? 'python' : language === 'javascript' || language === 'js' ? 'javascript' : 'cpp'}
              value={code}
              theme={theme}
              onChange={(value) => setCode(value || '')}
              options={{
                fontSize: fontSize,
                minimap: { enabled: false },
                padding: { top: 12 },
              }}
            />
            <div className="p-4 flex justify-end border-t border-cyan-400/20">
              <button
                onClick={handleRun}
                className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-2 rounded-lg font-bold uppercase border border-cyan-300 transition"
              >
                {loading ? 'Running...' : 'Run Code'}
              </button>
            </div>
          </div>

          {/* I/O */}
          <div className="flex flex-col gap-6">
            <div className="bg-black/30 rounded-xl border border-cyan-400/30 p-4">
              <h2 className="text-xl font-bold pb-2 text-cyan-300">Input</h2>
              <textarea
                rows={5}
                value={inputs}
                onChange={(e) => setInputs(e.target.value)}
                placeholder="Enter input for your program"
                className="w-full rounded-lg p-3 placeholder:text-cyan-400 text-white border border-cyan-400 bg-transparent resize-none focus:outline-none"
              />
            </div>
            <div className="bg-black/30 rounded-xl border border-cyan-400/30 p-4">
              <h2 className="text-xl font-bold pb-2 text-cyan-300">Output</h2>
              <textarea
                readOnly
                value={output}
                placeholder="Output will be displayed here..."
                className="w-full rounded-lg p-3 text-white placeholder:text-cyan-400 border border-cyan-400 bg-transparent min-h-[150px] resize-none focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompilerPage;
