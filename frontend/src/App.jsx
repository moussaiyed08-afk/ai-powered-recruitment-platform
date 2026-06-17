import { useState, useEffect } from 'react'; // 1. Importe useEffect
import Login from './Login';
import DashboardCandidat from './components/DashboardCandidat';
import DashboardRecruteur from './components/DashboardRecruteur';

function App() {
  // 2. Initialise l'état en regardant dans le localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 3. Sauvegarde dans le localStorage à chaque changement de user
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  return (
    <div className="main-app">
      {user ? (
        <div style={{ border: '5px solid red', padding: '20px' }}>
          {user.role === 'CANDIDAT' ? <DashboardCandidat /> : <DashboardRecruteur />}
          <button onClick={() => setUser(null)}>Déconnexion</button>
        </div>
      ) : (
        <Login onLoginSuccess={setUser} />
      )}
    </div>
  );
}

export default App;