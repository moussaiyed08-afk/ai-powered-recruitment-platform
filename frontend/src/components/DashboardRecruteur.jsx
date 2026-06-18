import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './DashboardRecruteur.css';

export default function DashboardRecruteur() {
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', company: '', description: '' });

  useEffect(() => {
    fetch('http://localhost:5000/api/jobs')
      .then(res => res.json())
      .then(data => setJobs(data));
  }, []);

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