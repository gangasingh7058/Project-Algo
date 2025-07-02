import Editor from '@monaco-editor/react';
import { useState } from 'react';
import axios from 'axios';

const ProblemSolveCodeArea = () => {
  const [code, setcode] = useState(`#include<iostream>\nusing namespace std;\nint main(){\n\n\n return 0;\n}`);
  const [fontsize, setfontsize] = useState(16);
  const [theme, settheme] = useState('vs-dark');
  const [codeinput, setcodeinput] = useState('');
  const [codeoutput, setcodeoutput] = useState('Code Output Will appear here ...');
  const [todisplay, settodisplay] = useState(codeoutput);
  const [active, setactive] = useState('output');
  const [language, setlanguage] = useState('cpp');
  const [loading, setloading] = useState(false);

  const handleOnChange = (e) => {
    if (active == 'output') return;
    setcodeinput(e.target.value);
    settodisplay(e.target.value);
  };

  const handleRun = async () => {
    if (code.includes('cin') && codeinput.trim() === '') {
      alert('Inputs Required for Given Code');
      return;
    }

    console.log(codeinput);
    

    setloading(true);
    try {
      const res = await axios.post('http://localhost:3002/run', {
        language: language,
        code: code,
        inputs: codeinput,
        mode: 'compiler'
      });

      if (res.data.success) {
        setcodeoutput(res.data.verdict);
        settodisplay(res.data.verdict)
      } else {
        console.log(res.data);
        
        setcodeoutput('Compilation Error');
        settodisplay("Compilation Error")
      }
    } catch (error) {
      setcodeoutput('Server error');
    } finally {
    //   settodisplay(codeoutput);
      setactive('output');
      setloading(false);
    }
  };

  return (
    <div className="space-y-6 bg-black/40 backdrop-blur-sm border-2 border-cyan-400/50 rounded-lg p-6">
      {/* Code Editor */}
      <div className="space-y-4">
        <div className="text-xl font-bold text-cyan-400 font-mono uppercase tracking-wider">
          Solve It!
        </div>

        <div className="flex gap-4 text-sm font-mono text-purple-300">
          <select
            className="bg-black/50 border-2 border-purple-500 text-cyan-300 rounded-md px-3 py-1"
            value={language}
            onChange={(e) => setlanguage(e.target.value)}
          >
            <option value="cpp">CPP</option>
          </select>

          <select
            className="bg-black/50 border-2 border-purple-500 text-cyan-300 rounded-md px-3 py-1"
            value={theme}
            onChange={(e) => settheme(e.target.value)}
          >
            <option className="bg-black" value="vs-dark">Dark</option>
            <option className="bg-black" value="light">Light</option>
            <option className="bg-black" value="vs">VS</option>
            <option className="bg-black" value="hc-black">High Contrast</option>
          </select>

          <select
            className="bg-black/50 border-2 border-purple-500 text-cyan-300 rounded-md px-3 py-1"
            value={fontsize}
            onChange={(e) => setfontsize(Number(e.target.value))}
          >
            {[12, 14, 16, 18, 20].map(size => (
              <option className="bg-black" key={size} value={size}>{size}px</option>
            ))}
          </select>
        </div>

        <div className="rounded-md overflow-hidden border-2 border-purple-500 shadow-lg">
          <Editor
            height="400px"
            theme={theme}
            defaultLanguage="cpp"
            value={code}
            onChange={(value) => setcode(value || '')}
            options={{
              padding: { top: 12 },
              fontSize: fontsize
            }}
          />
        </div>

        <div className="flex gap-4">
          <button
            disabled={loading}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-mono px-4 py-2 rounded-md border border-pink-400 shadow-md transition-all duration-300 hover:scale-105"
            onClick={handleRun}
          >
            {loading ? "Running..." : "Run"}
          </button>

          <button
            className="bg-gradient-to-r from-green-500 to-cyan-600 hover:from-green-400 hover:to-cyan-500 text-white font-mono px-4 py-2 rounded-md border border-green-400 shadow-md transition-all duration-300 hover:scale-105"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Input/Output */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            className="text-cyan-300 font-mono text-sm border border-cyan-400 rounded px-3 py-1 hover:bg-cyan-400/10"
            onClick={() => { settodisplay(codeinput); setactive('input'); }}
          >
            Console Input
          </button>
          <button
            className="text-cyan-300 font-mono text-sm border border-cyan-400 rounded px-3 py-1 hover:bg-cyan-400/10"
            onClick={() => { settodisplay(codeoutput); setactive('output'); }}
          >
            Console Output
          </button>
        </div>

        <textarea
          className="w-full h-32 bg-black/50 border-2 border-purple-500 text-cyan-300 placeholder:text-cyan-300 font-mono rounded-md px-4 py-2 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25"
          value={todisplay}
          readOnly={active == 'output'}
          onChange={handleOnChange}
          placeholder="Enter Custom Inputs ..."
        />
      </div>
    </div>
  );
};

export default ProblemSolveCodeArea;
