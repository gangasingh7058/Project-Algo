import Editor from '@monaco-editor/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import RunTestCasesResultModule from './RunTestCasesresultmodule';
import getusertoken from '../Helping Functions/getusertoken';
import {data, useNavigate} from 'react-router-dom'


const ProblemSolveCodeArea = ( { problemId } ) => {

  // to navigate
  const navigate=useNavigate();

  const [code, setcode] = useState(`#include<iostream>\nusing namespace std;\nint main(){\n\n\n return 0;\n}`);
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

    setrunloading(true);
    try {
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
        // console.log(res.data);        
        setcodeoutput("Compilation Error");
        settodisplay("Compilation Error");
      }
    } catch (error) {
      setcodeoutput('Server error');
    } finally {
    //   settodisplay(codeoutput);
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
        // console.log(error);
        alert("Some Error Occured While Running Test Cases");
               
    }finally {
        setrunTestcaseloading(false)
        setshowresultmodule(true);
        setshowaskai(true);
    }


  }


  const handleSubmit=async ()=>{

    if(runteastcaseresponse==null){
        alert("Run Test Cases First");
        return;
    }

    if(runteastcaseresponse.success==false){
        alert("All Test Cases not passes");
        return;
    }

    let token=getusertoken().split(" ")[1];
    if(token==null){
        alert("Unknown User");
        navigate('/user/signin');
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
        alert(response.data.msg);
        

    } catch (error) {
        // console.log(error);
        alert("Error Submitting")
        
    }finally {
        setsubmitloading(false);
    }

  }

  const handleAskAi=async ()=>{
 
    if(!runteastcaseresponse){
      return alert("Try Testcases First")
    }

    if(runteastcaseresponse.success==true){
      return alert("Your Code Already Passes All Test Cases")
    }

    try {
      
      setaskailoading(true);

      const response=await axios.post(`${import.meta.env.VITE_BACKEND_PORT}/ai/find_error`,{
          code,
          pid:problemId
         })

        // console.log(response.data);
        
      if(response.data.success==false){
        alert(response.data.msg);
      }

      setcode(response.data.res)
      
    } catch (error) {
      // console.log(error);
      return alert("Some Error Occured")
      
    }finally{
      setaskailoading(false);
    }

  }

  const handleGetHint=async ()=>{

    if(gothint){
      return alert("Hint Already Used")
    }

    try {
      setgethintloadinh(true);
      const response=await axios.post(`${import.meta.env.VITE_BACKEND_PORT}/ai/gethint`,{
        pid:problemId
      })

      if(!response.data.success){
        alert(response.data.msg);
      }
      else{
        setcode(code + `\n/*\n${response.data.res}\n*/`)
        setgothint(true);
      }

    } catch (error) {
      alert("Error getting Hints")
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

        <div>
            {showresultmodule  && <RunTestCasesResultModule response={runteastcaseresponse} setshowresultmodule={setshowresultmodule} />}
        </div>
        

    </div>
  );
};

export default ProblemSolveCodeArea;
