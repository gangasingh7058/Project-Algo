import Editor from '@monaco-editor/react';
import { useState } from 'react';
import axios from 'axios';
import RunTestCasesResultModule from './RunTestCasesresultmodule';
import getusertoken from '../Helping Functions/getusertoken';
import toast from '../Helping Functions/toast';
import { Copy, Keyboard, Terminal, Trash2 } from 'lucide-react';


const CODE_TEMPLATES = {
  cpp: `#include<iostream>\nusing namespace std;\n\nint main(){\n cout<<"Hello World"<<endl;\n\nreturn 0;\n}`,
  python: `print("Hello World")`,
  javascript: `console.log("Hello World");`
};

const ProblemSolveCodeArea = ( { problemId } ) => {

  const [code, setcode] = useState(CODE_TEMPLATES.cpp);
  const [fontsize, setfontsize] = useState(16);
  const [theme, settheme] = useState('vs-dark');
  const [codeinput, setcodeinput] = useState('');
  const [codeoutput, setcodeoutput] = useState('Code Output Will appear here ...');
  const [todisplay, settodisplay] = useState(codeoutput);
  const [active, setactive] = useState('output');
  const [language, setlanguage] = useState('cpp');
  const [runloading, setrunloading] = useState(false);
  const [runTestCaseloading,setrunTestcaseloading]=useState(false)
  const [submitloading,setsubmitloading]=useState(false);
  const [showresultmodule,setshowresultmodule]=useState(false);
  const [runteastcaseresponse,setruntestcaseresponse]=useState(null);
  const [askailoading,setaskailoading]=useState(false);
  const [showaskai,setshowaskai]=useState(false);
  const [gethintloading,setgethintloadinh]=useState(false);
  const [gothint,setgothint]=useState(false);

  const handleLanguageChange = (newLang) => {
    setlanguage(newLang);
    // If the current code matches one of the standard templates, automatically load default code for new language
    const isStandardCode = Object.values(CODE_TEMPLATES).some(template => template.trim() === code.trim());
    if (isStandardCode && CODE_TEMPLATES[newLang]) {
      setcode(CODE_TEMPLATES[newLang]);
    }
  };

  const handleOnChange = (e) => {
    if (active == 'output') return;
    setcodeinput(e.target.value);
    settodisplay(e.target.value);
  };

  const handleRun = async () => {
    const requiresInput = 
      (code.includes('cin') || code.includes('input()') || code.includes('readFileSync') || code.includes('Scanner')) && 
      codeinput.trim() === '';

    if (requiresInput) {
      toast.warning('Inputs Required for Given Code');
      return;
    }

    setrunloading(true);
    try {
      const checkifworking=await axios.get(`${import.meta.env.VITE_COMPILER_PORT}/health`);
      if(!checkifworking.data){
        setcodeoutput("Compiler Not responding");
        settodisplay("Compiler Not responding");
        return ;
      }
      const res = await axios.post(`${import.meta.env.VITE_COMPILER_PORT}/run`, {
        language: language,
        code: code,
        inputs: codeinput,
        mode: 'compiler'
      });

      if (res.data.success) {
        setcodeoutput(res.data.verdict);
        settodisplay(res.data.verdict);
      } else {
        const errorMsg = res.data.error || res.data.err || "Compilation Error";
        setcodeoutput(errorMsg);
        settodisplay(errorMsg);
      }
    } catch (error) {
      setcodeoutput('Server error');
    } finally {
      setactive('output');
      setrunloading(false);
    }
  };

  const handleRunTest=async ()=>{

        setrunTestcaseloading(true);

    try {
        
        const response=await axios.post(`${import.meta.env.VITE_BACKEND_PORT}/evaluate/run/${problemId}`,{
            code: code,
            language: language
        })


        if (response.data.received && response.data.received.length > 1000) {
              response.data.received = "Undefined";
            }

        setruntestcaseresponse(response.data);
        // console.log(response.data);
             

    } catch (error) {
        const errMsg = error.response?.data?.msg || error.response?.data?.err || error.response?.data?.error || error.message || "Some Error Occured While Running Test Cases";
        toast.error(errMsg);
    }finally {
        setrunTestcaseloading(false)
        setshowresultmodule(true);
        setshowaskai(true);
    }


  }


  const handleSubmit=async ()=>{

    let token=getusertoken()
    if(token==null){
        toast.warning("SignIn To Submit");
        return ;
    }
    
    token=token.split(" ")[1];

    if(runteastcaseresponse==null){
        toast.warning("Run Test Cases First");
        return;
    }

    if(runteastcaseresponse.success==false){
        toast.warning("All Test Cases not passed");
        return;
    }

    

    setsubmitloading(true);

    try {
        
        const response=await axios.post(`${import.meta.env.VITE_BACKEND_PORT}/evaluate/submit/${problemId}`,{
            code,
            language,
            usertoken:token
        })

        if(!response){
            throw error;
        }

        // OutPut User
        (response.data.success ? toast.success : toast.error)(response.data.msg);
        

    } catch (error) {
        const errMsg = error.response?.data?.msg || error.response?.data?.err || error.response?.data?.error || error.message || "Error Submitting";
        toast.error(errMsg);
    }finally {
        setsubmitloading(false);
    }

  }

  const handleAskAi=async ()=>{
 
    if(!runteastcaseresponse){
      return toast.warning("Try Testcases First")
    }

    if(runteastcaseresponse.success==true){
      return toast.success("Your Code Already Passes All Test Cases")
    }

    try {
      
      setaskailoading(true);

      const response=await axios.post(`${import.meta.env.VITE_BACKEND_PORT}/ai/find_error`,{
          code,
          pid:problemId
         })

        // console.log(response.data);
        
      if(response.data.success==false){
        toast.error(response.data.msg);
      }

      setcode(response.data.res)
      
    } catch (error) {
      const errMsg = error.response?.data?.msg || error.response?.data?.err || error.response?.data?.error || error.message || "Some Error Occured";
      return toast.error(errMsg);
    }finally{
      setaskailoading(false);
    }

  }

  const handleGetHint=async ()=>{

    if(gothint){
      return toast.info("Hint Already Used")
    }

    try {
      setgethintloadinh(true);
      const response=await axios.post(`${import.meta.env.VITE_BACKEND_PORT}/ai/gethint`,{
        pid:problemId
      })

      if(!response.data.success){
        toast.error(response.data.msg);
      }
      else{
        setcode(code + `\n/*\n${response.data.res}\n*/`)
        setgothint(true);
      }

    } catch (error) {
      const errMsg = error.response?.data?.msg || error.response?.data?.err || error.response?.data?.error || error.message || "Error getting Hints";
      toast.error(errMsg);
    } finally{
      setgethintloadinh(false);
    }

  }

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
            onChange={(e) => handleLanguageChange(e.target.value)}
          >
            <option className="bg-black" value="cpp">C++</option>
            <option className="bg-black" value="python">Python</option>
            <option className="bg-black" value="javascript">JavaScript</option>
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
            language={language === 'python' || language === 'py' ? 'python' : language === 'javascript' || language === 'js' ? 'javascript' : 'cpp'}
            value={code}
            onChange={(value) => {setcode(value || '');setruntestcaseresponse(null)}}
            options={{
              padding: { top: 12 },
              fontSize: fontsize
            }}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            disabled={runloading}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-mono px-4 py-2 rounded-md border border-pink-400 shadow-md transition-all duration-300 hover:scale-105"
            onClick={handleRun}
          >
            {runloading ? "Running..." : "Run"}
          </button>

          <button
            disabled={runTestCaseloading}
            className="bg-gradient-to-r from-red-500 to-orange-400 hover:from-red-400 hover:to-orange-500 text-white font-mono px-4 py-2 rounded-md border border-red-400 shadow-md transition-all duration-300 hover:scale-105"
            onClick={handleRunTest}
          >
            {!runTestCaseloading ? "Run Tests" : "Running Testcases ..."}
          </button>
          <button
          disabled={submitloading}
            className="bg-gradient-to-r from-green-500 to-cyan-600 hover:from-green-400 hover:to-cyan-500 text-white font-mono px-4 py-2 rounded-md border border-green-400 shadow-md transition-all duration-300 hover:scale-105"
            onClick={handleSubmit}
          >
            {submitloading?"Submitting..." : "Submit"}
          </button>
          {/* Get Hints From AI */}
          <button
          disabled={gethintloading}
            className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-white font-mono px-4 py-2 rounded-md border border-yellow-300 shadow-md transition-all duration-300 hover:scale-105"
            onClick={handleGetHint}
          >
            {gethintloading?"Getting..." : "Get Hint"}
          </button>
          {/*  ASK AI active when testcase fails */}
          {showaskai && 
            <button
            disabled={askailoading}
            className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-mono px-4 py-2 rounded-md border border-indigo-400 shadow-md transition-all duration-300 hover:scale-105"
            onClick={handleAskAi}
          >
            {askailoading?"Wait ...":"Ask Ai"}
          </button>
          }
        </div>
      </div>

      {/* Console: Input / Output */}
      <div className="rounded-lg overflow-hidden border-2 border-purple-500/70 bg-black/70 shadow-[0_0_18px_rgba(168,85,247,0.35)]">
        {/* Title bar with tabs */}
        <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-purple-900/60 to-cyan-900/40 border-b border-purple-500/40 px-3 py-2">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
            </div>
            <div className="flex gap-1 font-mono text-base">
              {[
                { key: 'input', label: 'Input', Icon: Keyboard, value: codeinput },
                { key: 'output', label: 'Output', Icon: Terminal, value: codeoutput },
              ].map(({ key, label, Icon, value }) => (
                <button
                  key={key}
                  onClick={() => { settodisplay(value); setactive(key); }}
                  className={`flex items-center gap-1.5 rounded px-3 py-1 border transition-all ${
                    active === key
                      ? 'border-cyan-400 bg-cyan-400/15 text-cyan-200 shadow-[0_0_8px_rgba(34,211,238,0.5)]'
                      : 'border-transparent text-gray-400 hover:text-cyan-300 hover:bg-white/5'
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1 text-gray-400">
            <button
              title="Copy"
              className="rounded p-1.5 hover:bg-white/10 hover:text-cyan-300"
              onClick={() => {
                navigator.clipboard?.writeText(active === 'input' ? codeinput : codeoutput)
                  .then(() => toast.success('Copied to clipboard', { duration: 1500 }))
                  .catch(() => toast.error('Could not copy'));
              }}
            >
              <Copy size={15} />
            </button>
            {active === 'input' && (
              <button
                title="Clear input"
                className="rounded p-1.5 hover:bg-white/10 hover:text-red-400"
                onClick={() => { setcodeinput(''); settodisplay(''); }}
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="relative">
          <textarea
            spellCheck={false}
            className={`block w-full h-40 resize-y bg-transparent px-4 py-3 font-mono text-lg leading-relaxed placeholder:text-gray-500 focus:outline-none focus:bg-cyan-400/5 ${
              active === 'output' ? 'text-green-300 cursor-default' : 'text-cyan-200'
            }`}
            value={active === 'input' ? codeinput : codeoutput}
            readOnly={active === 'output'}
            onChange={handleOnChange}
            placeholder="Enter custom input (stdin) ..."
          />
          <span className="pointer-events-none absolute bottom-1 right-3 text-[10px] font-mono uppercase tracking-widest text-purple-300/50">
            {active === 'input' ? 'stdin' : 'stdout · read-only'}
          </span>
        </div>
      </div>

        <div>
            {showresultmodule  && <RunTestCasesResultModule response={runteastcaseresponse} setshowresultmodule={setshowresultmodule} />}
        </div>
        

    </div>
  );
};

export default ProblemSolveCodeArea;
