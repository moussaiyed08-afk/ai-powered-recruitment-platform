import { useState, useEffect } from 'react';
import Login from './Login';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) setUser({ role });
  }, []);

  if (!user) return <Login onLoginSuccess={setUser} />;

  return (
    <div>
      <h1>Bienvenue sur la plateforme IA</h1>
      <p>Connecté en tant que : {user.role}</p>
      <button onClick={() => { localStorage.clear(); setUser(null); }}>Déconnexion</button>
    </div>
  );
}

export default App;