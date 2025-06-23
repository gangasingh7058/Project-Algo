import { useState } from 'react';
import axios from 'axios';
import Editor from '@monaco-editor/react';

const CompilerPage = () => {
  const [code, setCode] = useState(`#include <iostream>\nusing namespace std;\n\nint main() {\n    // your code goes here\n    return 0;\n}`);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  // NEW: font size and theme state
  const [fontSize, setFontSize] = useState(14);
  const [theme, setTheme] = useState('vs-dark');

  const handleRun = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3002/run', {
        language: 'cpp',
        code: code
      });

      if (res.data.success) {
        setOutput(res.data.verdict);
      } else {
        setOutput(res.data.error || "Error");
      }
    } catch (error) {
      setOutput("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto font-mono">
      <h1 className="text-3xl font-bold mb-4 text-center">C++ Compiler</h1>

      {/* Dropdowns */}
      <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
        <div className="flex gap-4">
          <div>
            <label className="mr-2 font-semibold">Font Size:</label>
            <select
              className="border px-2 py-1 rounded"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
            >
              {[12, 14, 16, 18, 20].map((size) => (
                <option key={size} value={size}>{size}px</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mr-2 font-semibold">Theme:</label>
            <select
              className="border px-2 py-1 rounded"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="vs-dark">Dark</option>
              <option value="light">Light</option>
              <option value="vs">VS</option>
              <option value="hc-black">High Contrast</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleRun}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Running...' : 'Run Code'}
        </button>
      </div>

      {/* Monaco Editor */}
      <Editor
        height="300px"
        defaultLanguage="cpp"
        value={code}
        theme={theme}
        onChange={(value) => setCode(value || '')}
        options={{
          fontSize: fontSize,
          minimap: { enabled: false },
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
        }}
      />

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Output:</h2>
        <pre className="bg-gray-100 p-3 rounded border min-h-[100px] whitespace-pre-wrap">
          {output || 'Output will appear here...'}
        </pre>
      </div>
    </div>
  );
};

export default CompilerPage;
