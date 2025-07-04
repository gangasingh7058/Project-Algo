import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import CompilerPage from './Pages/Compiler';
import VantaDots from './Background/vantabackground';
import SignInPage from './Pages/SigninPage';
import LandingPage from './Pages/LandingPage';
import HomePage from './Pages/Home';
import RetroSigninPage from './Pages/RetroSigninPage';
import RegisterPage from './Pages/RegisterPage';
import ProblemSolvePage from './Pages/ProblemSolve';
import SubmissionsPage from './Pages/SubmissionPage';
import './App.css'

function App() {
  return (
    <Router>
      {/* <VantaDots /> */}
      
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path="/compiler" element={<CompilerPage />} />
        {/* <Route path='/user/signin' element={<SignInPage />} /> */}
        <Route path='/home' element={<HomePage />} />
        <Route path='/user/signin' element={<RetroSigninPage />} />
        <Route path='/user/register' element={<RegisterPage />} />
        <Route path='home/problem/:pid' element={<ProblemSolvePage />} />
        <Route path='/user/submissions' element={<SubmissionsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
