import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // 1. Import nécessaire pour la navigation
import './DashboardCandidat.css';

export default function DashboardCandidat() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/jobs')
      .then(res => res.json())
      .then(data => setJobs(data))
      .catch(err => console.error("Erreur chargement jobs:", err));
  }, []);

  return (
  <div className="dashboard-container">
    <h2 className="dashboard-title">Offres d'emploi disponibles</h2>

    <div className="offres-list">
      {jobs.map((job) => {
        const isNew = (new Date() - new Date(job.createdAt)) < (24 * 60 * 60 * 1000);

        return (
          <div key={job.id} className="job-card">
            <div className="job-card-header">
              <h3 className="job-card-title">{job.title}</h3>
              {isNew && <span className="job-card-badge">New</span>}
            </div>
            <p className="job-card-company">
              <strong>Entreprise :</strong> {job.company}
            </p>
            <Link to={`/job/${job.id}`} className="job-card-link">
              Voir le détail →
            </Link>
          </div>
        );
      })}
    </div>
  </div>
);
}