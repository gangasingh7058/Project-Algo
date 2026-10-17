import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import CompilerPage from './Pages/Compiler';
import HomePage from './Pages/Home';
import RetroSigninPage from './Pages/RetroSigninPage';
import RegisterPage from './Pages/RegisterPage';
import ProblemSolvePage from './Pages/ProblemSolve';
import SubmissionsPage from './Pages/SubmissionPage';
import PersonalBrandingComponent from './Components/personal_branding';
import Toaster from './Components/Toaster';
import './App.css'

function App() {
  return (
    // Honour the OS "reduce motion" setting for every Framer Motion animation
    <MotionConfig reducedMotion="user">
      <Router>
        <Routes>
          <Route path='/' element={<Navigate to="/home" replace />} />
          <Route path="/compiler" element={<CompilerPage />} />
          <Route path='/home' element={<HomePage />} />
          <Route path='/user/signin' element={<RetroSigninPage />} />
          <Route path='/user/register' element={<RegisterPage />} />
          <Route path='home/problem/:pid' element={<ProblemSolvePage />} />
          <Route path='/user/submissions' element={<SubmissionsPage />} />
        </Routes>
        <PersonalBrandingComponent />
        <Toaster />
      </Router>
    </MotionConfig>
  );
}

export default App;
