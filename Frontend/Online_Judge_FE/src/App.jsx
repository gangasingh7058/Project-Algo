import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import CompilerPage from './Pages/Compiler';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/compiler" element={<CompilerPage />} />
      </Routes>
    </Router>
  );
}

export default App;
