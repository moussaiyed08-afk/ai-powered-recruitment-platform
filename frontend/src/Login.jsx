import { useState } from 'react';
import './Login.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Login({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '', password: '', role: 'CANDIDAT', entreprise: '', enChomage: false,
  });
  const [rememberMe, setRememberMe] = useState(true); // visuel pour l'instant, voir note en bas
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isRegister
      ? `${API_URL}/api/auth/register`
      : `${API_URL}/api/auth/login`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      if (isRegister) {
        alert('Succès ! Vous pouvez vous connecter.');
        setIsRegister(false);
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        localStorage.setItem('userId', data.user.id);
        onLoginSuccess(data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Panneau illustratif — masqué sur mobile */}
      <aside className="auth-illustration" aria-hidden="true">
        <span className="shape shape-1" />
        <span className="shape shape-2" />
        <span className="shape shape-3" />
        <span className="shape shape-4" />

        <div className="badge-bubble">
          <span className="badge-value">+20</span>
          <span className="badge-label">offres cette semaine</span>
        </div>

        <div className="illustration-text">
          <h1 className="brand-title">JobBoard.</h1>
          <p className="illustration-tagline">
            Trouvez le poste idéal ou le candidat parfait, simplement.
          </p>
        </div>
      </aside>

      {/* Panneau formulaire */}
      <main className="auth-panel">
        <form onSubmit={handleSubmit} className="auth-form">
          <h2>{isRegister ? 'Créer un compte' : 'Bon retour !'}</h2>
          <p className="auth-subtitle">
            {isRegister ? 'Renseignez vos informations ci-dessous.' : 'Entrez vos identifiants ci-dessous.'}
          </p>

          {error && <p className="error">{error}</p>}

          {isRegister && (
            <div className="input-row">
              <input
                type="text"
                placeholder="Nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Prénom"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                required
              />
            </div>
          )}

          <input
            type="email"
            placeholder="Adresse email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          {isRegister && (
            <>
              <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                <option value="CANDIDAT">Candidat</option>
                <option value="RECRUTEUR">Recruteur</option>
              </select>

              {formData.role === 'RECRUTEUR' ? (
                <input
                  type="text"
                  placeholder="Entreprise"
                  value={formData.entreprise}
                  onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
                />
              ) : (
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.enChomage}
                    onChange={(e) => setFormData({ ...formData, enChomage: e.target.checked })}
                  />
                  En chômage
                </label>
              )}
            </>
          )}

          {!isRegister && (
            <div className="form-row">
              <label className="checkbox-label">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                Se souvenir de moi
              </label>
              <a href="#forgot" className="link-muted">Mot de passe oublié ?</a>
            </div>
          )}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? '...' : isRegister ? "S'inscrire" : 'Se connecter'}
          </button>

          {!isRegister && (
            <>
              <div className="divider"><span>ou se connecter avec</span></div>
              <button type="button" className="btn-google">
                <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.4-.4-3.5Z" />
                  <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.5 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l6-6C34.6 5.1 29.6 3 24 3c-7.7 0-14.4 4.4-17.7 10.7Z" />
                  <path fill="#4CAF50" d="M24 45c5.5 0 10.4-1.8 14.3-5l-6.6-5.4C29.6 36.4 26.9 37 24 37c-5.3 0-9.7-3.1-11.3-7.6l-6.6 5.1C9.2 40.5 15.9 45 24 45Z" />
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.6 5.4C41.5 35.9 45 30.5 45 24c0-1.2-.1-2.4-.4-3.5Z" />
                </svg>
                Google
              </button>
            </>
          )}

          <p className="switch-mode">
            {isRegister ? 'Déjà un compte ? ' : 'Pas de compte ? '}
            <span onClick={() => setIsRegister(!isRegister)} className="link-strong">
              {isRegister ? 'Connectez-vous' : 'Inscrivez-vous gratuitement'}
            </span>
          </p>
        </form>
      </main>
    </div>
  );
}
