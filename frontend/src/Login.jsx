import { useState } from 'react';
import './Login.css';

export default function Login({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '', password: '', role: 'CANDIDAT', entreprise: '', enChomage: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const endpoint = isRegister ? 'http://localhost:5000/api/auth/register' : 'http://localhost:5000/api/auth/login';
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      if (isRegister) {
        alert("Succès ! Vous pouvez vous connecter.");
        setIsRegister(false);
      } else {
        // C'est ici que tu dois faire la modification :
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role); // <-- AJOUTE CETTE LIGNE
        
        onLoginSuccess(data.user);
      
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>{isRegister ? "Inscription" : "Connexion"}</h2>
        {error && <p className="error">{error}</p>}
        
        {isRegister && (
          <>
            <input type="text" placeholder="Nom" onChange={(e) => setFormData({...formData, nom: e.target.value})} required />
            <input type="text" placeholder="Prénom" onChange={(e) => setFormData({...formData, prenom: e.target.value})} required />
          </>
        )}
        <input type="email" placeholder="Email" onChange={(e) => setFormData({...formData, email: e.target.value})} required />
        <input type="password" placeholder="Mot de passe" onChange={(e) => setFormData({...formData, password: e.target.value})} required />

        {isRegister && (
          <>
            <select onChange={(e) => setFormData({...formData, role: e.target.value})}>
              <option value="CANDIDAT">Candidat</option>
              <option value="RECRUTEUR">Recruteur</option>
            </select>
            {formData.role === 'RECRUTEUR' ? (
              <input type="text" placeholder="Entreprise" onChange={(e) => setFormData({...formData, entreprise: e.target.value})} />
            ) : (
              <label><input type="checkbox" onChange={(e) => setFormData({...formData, enChomage: e.target.checked})} /> En chômage</label>
            )}
          </>
        )}
        <button type="submit" disabled={loading}>{loading ? "..." : "Valider"}</button>
        <p onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "Déjà un compte ? Connectez-vous" : "Pas de compte ? Inscrivez-vous"}
        </p>
      </form>
    </div>
  );
}