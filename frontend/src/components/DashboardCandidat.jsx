import { useState, useEffect } from 'react';
import './DashboardCandidat.css';// <--- C'est ici que tu fais la liaison !
export default function DashboardCandidat() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
  fetch('http://localhost:5000/api/jobs') // 5000 au lieu de 3000
    .then(res => res.json())
    .then(data => setJobs(data))
    .catch(err => console.error("Erreur chargement jobs:", err));
}, []);

  return (
    <div className="dashboard-container">
      <h2>Offres d'emploi disponibles</h2>
      
      <div className="offres-grid"> {/* Changé de 'jobs-grid' à 'offres-grid' */}
  {jobs.map((job) => {
  // Calcul de la différence en millisecondes
  const isNew = (new Date() - new Date(job.createdAt)) < (24 * 60 * 60 * 1000);

  return (
    <div key={job.id} className="job-card">
      <div className="job-card-header">
        <h3 className="job-card-title">{job.title}</h3>
        {/* Affichage conditionnel */}
        {isNew && <span className="job-card-badge">New</span>}
      </div>
      {/* ... reste de ton code ... */}
    </div>
  );
})}
</div>

      {selectedJob && (
        <div className="modal">
          <div className="modal-content">
            <button onClick={() => setSelectedJob(null)}>Fermer</button>
            <h2>{selectedJob.title}</h2>
            <p><strong>Entreprise :</strong> {selectedJob.company}</p>
            <p><strong>Description :</strong> {selectedJob.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}