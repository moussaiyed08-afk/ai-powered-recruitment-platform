import { useState } from 'react';
import Login from './Login';
import DashboardCandidat from './components/DashboardCandidat';
import DashboardRecruteur from './components/DashboardRecruteur';

function App() {
  const [user, setUser] = useState(null);
  console.log("DashboardCandidat est :", DashboardCandidat);
console.log("DashboardRecruteur est :", DashboardRecruteur);

  return (
    <div className="main-app">
      {user ? (
        user.role === 'CANDIDAT' ? <DashboardCandidat /> : <DashboardRecruteur />
      ) : (
        <Login onLoginSuccess={setUser} />
      )}
    </div>
  );
}

// CETTE LIGNE EST OBLIGATOIRE ET DOIT ÊTRE À LA FIN DU FICHIER
export default App;