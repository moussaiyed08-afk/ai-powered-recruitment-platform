import { useState, useEffect } from 'react';
import './DashboardRecruteur.css';

export default function DashboardRecruteur() {
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', company: '', description: '' });

  // Chargement des jobs
  useEffect(() => {
    fetch('http://localhost:5000/api/jobs')
      .then(res => res.json())
      .then(data => setJobs(data));
  }, []);

  // Fonction pour ajouter un job
  const handleAddJob = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newJob)
    });
    
    if (res.ok) {
      const data = await res.json();
      setJobs([data, ...jobs]); 
      setShowForm(false);
      setNewJob({ title: '', company: '', description: '' });
      alert("Offre publiée !");
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Tableau de bord Recruteur</h2>
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? "Annuler" : "+ Ajouter une offre"}
      </button>

      {showForm && (
        <form onSubmit={handleAddJob} className="job-form">
          <input type="text" placeholder="Titre" onChange={e => setNewJob({...newJob, title: e.target.value})} required />
          <input type="text" placeholder="Entreprise" onChange={e => setNewJob({...newJob, company: e.target.value})} required />
          <textarea placeholder="Description" onChange={e => setNewJob({...newJob, description: e.target.value})} required />
          <button type="submit">Publier l'offre</button>
        </form>
      )}

      <div className="offres-grid">
        {jobs.map((job) => {
          const isNew = (new Date() - new Date(job.createdAt)) < (24 * 60 * 60 * 1000);
          return (
            <div key={job.id} className="job-card">
              <div className="job-card-header">
                <h3 className="job-card-title">{job.title}</h3>
                {isNew && <span className="job-card-badge">New</span>}
              </div>
              <p>{job.company}</p>
              <p>{job.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}