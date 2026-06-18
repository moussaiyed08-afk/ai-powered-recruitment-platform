import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './JobDetails.css';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/jobs/${id}`)
      .then((res) => res.json())
      .then((data) => setJob(data))
      .catch((err) => console.error("Erreur:", err));
  }, [id]);

  if (!job) return <p className="details-loading">Chargement des détails...</p>;

  return (
    <div className="details-container">
      <button className="btn-back" onClick={() => navigate(-1)}>
        ← Retour
      </button>

      <h1 className="details-title">{job.title}</h1>
      <h3 className="details-company">{job.company}</h3>
      <p className="details-description">{job.description}</p>

      <button
        className="btn-apply"
        onClick={() => alert("Candidature envoyée !")}
      >
        Postuler à cette offre
      </button>
    </div>
  );
}