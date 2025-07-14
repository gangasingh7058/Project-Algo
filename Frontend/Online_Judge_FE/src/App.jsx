import { BrowserRouter as Router, Routes, Route, useFetcher } from 'react-router-dom';
import { useEffect, useState } from 'react';
import CompilerPage from './Pages/Compiler';
import HomePage from './Pages/Home';
import RetroSigninPage from './Pages/RetroSigninPage';
import RegisterPage from './Pages/RegisterPage';
import ProblemSolvePage from './Pages/ProblemSolve';
import SubmissionsPage from './Pages/SubmissionPage';
import { useNavigate } from 'react-router-dom';
import PersonalBrandingComponent from './Components/personal_branding';
import './App.css'

function App() {
  return (
    <Router>
      {/* <VantaDots /> */}
      
      <Routes>
        <Route path='/' element={<EntryPage />} />
        <Route path="/compiler" element={<CompilerPage />} />
        {/* <Route path='/user/signin' element={<SignInPage />} /> */}
        <Route path='/home' element={<HomePage />} />
        <Route path='/user/signin' element={<RetroSigninPage />} />
        <Route path='/user/register' element={<RegisterPage />} />
        <Route path='home/problem/:pid' element={<ProblemSolvePage />} />
        <Route path='/user/submissions' element={<SubmissionsPage />} />
      </Routes>
      <PersonalBrandingComponent />
    </Router>
  );
}

export default App;


const EntryPage=()=>{

    const navigate=useNavigate();

    useEffect(()=>{
      navigate('/home')
    },[])

    return <>

    </>

}
