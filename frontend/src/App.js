import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import ResumeUpload from './components/ResumeUpload';
import ResumeList from './components/ResumeList';
import JobForm from './components/JobForm';
import JobList from './components/JobList';
import JobMatch from './components/JobMatch';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload-resume" element={<ResumeUpload />} />
            <Route path="/resumes" element={<ResumeList />} />
            <Route path="/add-job" element={<JobForm />} />
            <Route path="/jobs" element={<JobList />} />
            <Route path="/match/:jobId" element={<JobMatch />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;