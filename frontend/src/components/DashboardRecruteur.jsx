import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout, { StatCard } from '../components/Layout';
import './DashboardRecruteur.css';

const TABS = [
  { key: 'all', label: 'Toutes les offres' },
  { key: 'live', label: 'En ligne' },
  { key: 'draft', label: 'Brouillons' },
  { key: 'closed', label: 'Clôturées' },
];

const STATUS_LABEL = { live: 'En ligne', draft: 'Brouillon', closed: 'Clôturée' };

export default function DashboardRecruteur({ jobs, setJobs, search, setSearch, activeTab, setActiveTab }) {
  
  // Fonction pour supprimer une offre
  const handleDelete = async (jobId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) {
      try {
        const response = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
        if (response.ok) {
          // Met à jour la liste localement pour rafraîchir l'interface
          setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
        } else {
          alert("Erreur lors de la suppression");
        }
      } catch (error) {
        console.error("Erreur serveur :", error);
      }
    }
  };

  // Stats calculées dynamiquement depuis les props
  const stats = useMemo(() => {
    const live = jobs.filter((j) => (j.status || 'live') === 'live').length;
    const draft = jobs.filter((j) => j.status === 'draft').length;
    const closed = jobs.filter((j) => j.status === 'closed').length;
    return { total: jobs.length, live, draft, closed };
  }, [jobs]);

  const visibleJobs = useMemo(() => {
    let list = jobs;
    if (activeTab !== 'all') {
      list = list.filter((j) => (j.status || 'live') === activeTab);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (j) => j.title.toLowerCase().includes(q) || j.company?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [jobs, activeTab, search]);

  return (
    <Layout
      role="recruteur"
      activeKey="jobs"
      userName="Vous"
      userRole="Recruteur"
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Rechercher un poste, une catégorie..."
    >
      <div className="page-header">
        <div>
          <h1 className="page-title">Job board</h1>
          <p className="page-subtitle">Créez une nouvelle offre ou modifiez vos offres existantes</p>
        </div>
        <Link to="/create-job" className="btn-primary">+ Nouvelle offre</Link>
      </div>

      <div className="stats-row">
        <StatCard value={stats.total} label="Offres créées" accent="#185fa5" />
        <StatCard value={stats.live} label="Offres en ligne" accent="#ee4d4d" />
        <StatCard value={stats.draft} label="Offres en attente" accent="#e0a13a" />
        <StatCard value={stats.closed} label="Offres clôturées" accent="#3fa876" />
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

      {visibleJobs.length === 0 ? (
        <div className="state-panel">Aucune offre ne correspond à ces critères.</div>
      ) : (
        <div className="jobs-grid">
          {visibleJobs.map((job) => {
            const jobStatus = job.status || 'live';
            return (
              <div key={job.id} className="job-card">
                <div className="job-card-top">
                  <span className="job-card-icon" aria-hidden="true">
                    <svg viewBox="0 0 20 20" fill="none">
                      <rect x="3" y="3" width="14" height="14" rx="4" fill="#185fa5" />
                      <path d="M7 10h6M7 13h4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  </span>
                  <span className={`job-status job-status-${jobStatus}`}>
                    <span className="status-dot" /> {STATUS_LABEL[jobStatus]}
                  </span>
                </div>

                <h3 className="job-card-title">{job.title}</h3>
                <p className="job-card-desc">{job.description}</p>

                <div className="job-card-tags">
                  {job.type && <span className="tag">{job.type}</span>}
                  {job.contract && <span className="tag">{job.contract}</span>}
                  {job.location && <span className="tag">{job.location}</span>}
                </div>

                <div className="job-card-applicants">
                  {job.applicantsCount ?? 0} candidature{(job.applicantsCount ?? 0) > 1 ? 's' : ''}
                </div>

                <div className="job-card-actions">
                  <Link to={`/job/${job.id}/candidatures`}>Voir candidatures</Link>
                  <span className="divider" />
                  <Link to={`/edit-job/${job.id}`}>Modifier</Link>
                  <span className="divider" />
                  <button 
                    className="btn-delete" 
                    onClick={() => handleDelete(job.id)}
                    style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}