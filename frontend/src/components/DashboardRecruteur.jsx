import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './DashboardRecruteur.css';
import { getConnectedUser } from './authUtils'; 

export default function DashboardRecruteur() {
  // Debug : lecture immédiate du localStorage
  const userId = localStorage.getItem('userId');
  console.log("ID trouvé dans le stockage au chargement :", userId);

  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', company: '', description: '' });
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Vérification de la session au chargement
    const user = getConnectedUser();
    if (!user) {
      navigate('/login');
      return;
    }

    // 2. Chargement des jobs
    fetch('http://localhost:5000/api/jobs')
      .then(res => res.json())
      .then(data => setJobs(data));
  }, [navigate]);

  const handleAddJob = async (e) => {
    e.preventDefault();
    
    // Récupération sécurisée
    const recruiterId = localStorage.getItem('userId');
    
    if (!recruiterId || recruiterId === "null") {
        alert("Session expirée. Veuillez vous reconnecter.");
        navigate('/login');
        return;
    }

    const res = await fetch('http://localhost:5000/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newJob,
        recruiterId: recruiterId 
      })
    });
    
    if (res.ok) {
      const data = await res.json();
      setJobs([data, ...jobs]); 
      setShowForm(false);
      setNewJob({ title: '', company: '', description: '' });
      alert("Offre publiée !");
    } else {
      const errorData = await res.json();
      alert("Erreur : " + (errorData.error || "Impossible d'ajouter l'offre"));
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Tableau de bord recruteur</h2>
        <button className="btn-toggle-form" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Annuler" : "+ Ajouter une offre"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddJob} className="job-form">
          <input
            type="text"
            placeholder="Titre"
            value={newJob.title}
            onChange={e => setNewJob({ ...newJob, title: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Entreprise"
            value={newJob.company}
            onChange={e => setNewJob({ ...newJob, company: e.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            value={newJob.description}
            onChange={e => setNewJob({ ...newJob, description: e.target.value })}
            required
          />
          <button type="submit" className="btn-submit-job">Publier l'offre</button>
        </form>
      )}

      <div className="offres-list">
        {jobs.map((job) => {
          const isNew = (new Date() - new Date(job.createdAt)) < (24 * 60 * 60 * 1000);
          return (
            <div key={job.id} className="job-card">
              <div className="job-card-header">
                <h3 className="job-card-title">{job.title}</h3>
                {isNew && <span className="job-card-badge">New</span>}
              </div>
              <p className="job-card-company">{job.company}</p>

              <div className="actions">
                <Link className="action-link" to={`/job/${job.id}`}>Voir détail</Link>
                <Link className="action-link action-link-edit" to={`/edit-job/${job.id}`}>Modifier</Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}