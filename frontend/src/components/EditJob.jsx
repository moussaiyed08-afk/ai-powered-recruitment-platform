import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditJob.css';

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState({ title: '', company: '', description: '' });

  useEffect(() => {
    fetch(`http://localhost:5000/api/jobs/${id}`)
      .then(res => res.json())
      .then(data => setJob(data));
  }, [id]);

  // Définis la fonction UNE SEULE FOIS
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    const res = await fetch(`http://localhost:5000/api/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job)
    });

    const data = await res.text(); // Permet d'éviter le plantage si ce n'est pas du JSON
    
    if (res.ok) {
      alert("Offre mise à jour !");
      navigate('/');
    } else {
      console.error("Erreur serveur :", data);
      alert("Erreur lors de la mise à jour : " + data);
    }
  };

  return (
    <form onSubmit={handleUpdate} className="edit-job-form">
      <h2 className="edit-job-title">Modifier l'offre</h2>
      
      <div className="form-group">
        <label>Titre :</label>
        <input value={job.title} onChange={e => setJob({...job, title: e.target.value})} />
      </div>

      <div className="form-group">
        <label>Entreprise :</label>
        <input value={job.company} onChange={e => setJob({...job, company: e.target.value})} />
      </div>

      <div className="form-group">
        <label>Description :</label>
        <textarea value={job.description} onChange={e => setJob({...job, description: e.target.value})} />
      </div>

      <button type="submit" className="btn-submit">Enregistrer</button>
    </form>
  );
}