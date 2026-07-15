import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import DashboardCandidat from './components/DashboardCandidat';
import DashboardRecruteur from './components/DashboardRecruteur';
import Sauvegardees from './components/Sauvegardees';
import JobDetails from './components/JobDetails';
import EditJob from './components/EditJob';
import CreateJob from './components/CreateJob';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState(() => {
    const saved = localStorage.getItem('savedJobs');
    return saved ? JSON.parse(saved) : [];
  });

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (user) {
      fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/jobs`)
        .then((res) => res.json())
        .then((data) => setJobs(data))
        .catch((err) => console.error("Erreur chargement global des jobs:", err));
    }
  }, [user]);

  return (
    <Router>
      <div className="main-app">
        {user ? (
          <>
            <button onClick={() => setUser(null)}>Déconnexion</button>
            
            <Routes>
              <Route 
                path="/" 
                element={user.role === 'CANDIDAT' ? 
                  <DashboardCandidat 
                    jobs={jobs} 
                    setJobs={setJobs} 
                    savedJobs={savedJobs} 
                    setSavedJobs={setSavedJobs} 
                  /> : 
                  <DashboardRecruteur 
                    jobs={jobs} 
                    setJobs={setJobs} 
                    search={search} 
                    setSearch={setSearch} 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab} 
                  />
                } 
              />
              
              <Route path="/candidat/sauvegardees" element={<Sauvegardees jobs={jobs} savedJobs={savedJobs} />} />
              <Route path="/create-job" element={<CreateJob />} />
              <Route path="/job/:id" element={<JobDetails />} />
              <Route path="/edit-job/:id" element={<EditJob />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </>
        ) : (
          <Login onLoginSuccess={setUser} />
        )}
      </div>
    </Router>
  );
}

export default App;