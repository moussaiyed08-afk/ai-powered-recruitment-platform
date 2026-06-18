import { useState, useEffect } from 'react';
import Login from './Login';
import DashboardCandidat from './components/DashboardCandidat';
import DashboardRecruteur from './components/DashboardRecruteur';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import JobDetails from './components/JobDetails';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  return (
    <Router>
      <div className="main-app">
        {user ? (
          <>
            {/* Bouton de déconnexion global */}
            <button onClick={() => setUser(null)}>Déconnexion</button>
            
            <Routes>
              {/* Redirection selon le rôle */}
              <Route path="/" element={user.role === 'CANDIDAT' ? <DashboardCandidat /> : <DashboardRecruteur />} />
              <Route path="/job/:id" element={<JobDetails />} />
              {/* Sécurité : redirection par défaut */}
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