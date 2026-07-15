import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import './DashboardCandidat.css'; 

export default function Sauvegardees({ jobs, savedJobs }) {
  // Filtrer les jobs : on ne garde que ceux présents dans la liste savedJobs
  // Utilisation de String() pour s'assurer que la comparaison fonctionne quel que soit le type d'ID
  const filteredJobs = useMemo(() => {
    // Debug : vérifions ce qui arrive dans le composant
    console.log("Jobs reçus dans Sauvegardees :", jobs);
    console.log("IDs sauvegardés reçus :", savedJobs);
    
    return jobs.filter(job => savedJobs.includes(String(job.id)));
  }, [jobs, savedJobs]);

  return (
    <Layout 
      role="candidat" 
      activeKey="saved" 
      userName="Vous" 
      userRole="Candidat"
    >
      <div className="page-header">
        <h1 className="page-title">Mes offres sauvegardées</h1>
        <p className="page-subtitle">Retrouvez ici les offres que vous avez marquées.</p>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="state-panel">
          <p>Aucune offre sauvegardée pour le moment.</p>
          <Link to="/">Parcourir les offres</Link>
        </div>
      ) : (
        <div className="jobs-grid">
          {filteredJobs.map(job => (
            <div key={job.id} className="job-card">
              <h3 className="job-card-title">{job.title}</h3>
              <p className="job-card-company">{job.company}</p>
              
              <div className="job-card-tags">
                <span className="tag">{job.type}</span>
                <span className="tag">{job.location}</span>
              </div>

              <div className="job-card-actions">
                <Link to={`/job/${job.id}`} className="job-card-link">Voir le détail</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}