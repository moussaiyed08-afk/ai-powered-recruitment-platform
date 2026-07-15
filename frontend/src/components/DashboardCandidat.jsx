import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout, { StatCard } from '../components/Layout';
import './DashboardCandidat.css';

const DAY_MS = 24 * 60 * 60 * 1000;

const TABS = [
  { key: 'all', label: 'Toutes les offres' },
  { key: 'new', label: 'Nouvelles' },
];

export default function DashboardCandidat({ jobs, savedJobs, setSavedJobs }) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  const status = 'success';

  // Nouvelle fonction avec garantie d'unicité
  const toggleSaveJob = (jobId) => {
    const idStr = String(jobId);
    setSavedJobs((prev) => {
      const isAlreadySaved = prev.includes(idStr);
      const newState = isAlreadySaved 
        ? prev.filter(id => id !== idStr) 
        : [...new Set([...prev, idStr])]; 
        
      return newState;
    });
  };

  const jobsWithFreshness = useMemo(
    () =>
      jobs.map((job) => ({
        ...job,
        isNew: Date.now() - new Date(job.createdAt).getTime() < DAY_MS,
      })),
    [jobs]
  );

  // Correction du calcul des stats pour éviter le décalage
  const stats = useMemo(() => {
    // On ne compte que les IDs sauvegardés qui correspondent à un job existant
    const validSavedJobs = savedJobs.filter(id => 
      jobs.some(j => String(j.id) === String(id))
    );
    
    return { 
      total: jobs.length,
      saved: validSavedJobs.length 
    };
  }, [jobs, savedJobs]);

  const visibleJobs = useMemo(() => {
    let list = jobsWithFreshness;
    if (activeTab === 'new') list = list.filter((j) => j.isNew);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (j) => j.title.toLowerCase().includes(q) || j.company?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [jobsWithFreshness, activeTab, search]);

  return (
    <Layout
      role="candidat"
      activeKey="jobs"
      userName="Vous"
      userRole="Candidat"
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Rechercher un poste, une entreprise..."
    >
      <div className="page-header">
        <div>
          <h1 className="page-title">Offres d'emploi</h1>
          <p className="page-subtitle">Parcourez les offres disponibles</p>
        </div>
      </div>

      <div className="stats-row">
        <StatCard value={stats.total} label="Offres disponibles" accent="#185fa5" />
        <StatCard value={stats.saved} label="Offres sauvegardées" accent="#8e6bb0" />
      </div>

      <div className="tabs-row">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn${activeTab === tab.key ? ' tab-btn-active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="list-meta">
        <span>{visibleJobs.length} offre{visibleJobs.length > 1 ? 's' : ''}</span>
      </div>

      {status === 'success' && visibleJobs.length > 0 && (
        <div className="jobs-grid">
          {visibleJobs.map((job) => (
            <div key={job.id} className="job-card">
              <h3 className="job-card-title">{job.title}</h3>
              <p className="job-card-company">{job.company}</p>

              <div className="job-card-actions">
                <button 
                  className={`btn-save ${savedJobs.includes(String(job.id)) ? 'active' : ''}`}
                  onClick={() => toggleSaveJob(job.id)}
                >
                  {savedJobs.includes(String(job.id)) ? '★ Sauvegardé' : '☆ Sauvegarder'}
                </button>
                <Link to={`/job/${job.id}`} className="job-card-link">Voir le détail</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}