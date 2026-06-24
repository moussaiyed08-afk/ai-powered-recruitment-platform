import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './JobDetails.css';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [score, setScore] = useState(null); // État pour stocker le score IA
  const [isAnalyzing, setIsAnalyzing] = useState(false); // État de chargement
  const fileInputRef = useRef(null); // Référence pour l'input masqué

  useEffect(() => {
    fetch(`http://localhost:5000/api/jobs/${id}`)
      .then((res) => res.json())
      .then((data) => setJob(data))
      .catch((err) => console.error("Erreur:", err));
  }, [id]);

  // Gère le clic sur le bouton d'action
  const handleApplyClick = () => {
    // Si on a déjà un score >= 70, on déclenche l'envoi final
    if (score >= 70) {
      alert("Candidature finale envoyée avec succès !");
    } else {
      fileInputRef.current.click();
    }
  };

  // Gère l'envoi après sélection du fichier
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsAnalyzing(true);
    const reader = new FileReader();
    
    reader.onloadend = async () => {
      const payload = { cvBase64: reader.result, fileName: file.name };

      try {
        // Envoi au backend pour analyse IA + enregistrement
        const res = await axios.post(`http://localhost:5000/api/apply/${id}`, payload);
        
        // --- MISE À JOUR DU SCORE ---
        setScore(res.data.score); 
        alert(`Analyse terminée ! Score : ${res.data.score}%`);
      } catch (err) {
        console.error("Erreur :", err.message);
        alert("Erreur lors de l'analyse.");
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!job) return <p className="details-loading">Chargement des détails...</p>;

  return (
    <div className="details-container">
      <button className="btn-back" onClick={() => navigate(-1)}>← Retour</button>
      <h1 className="details-title">{job.title}</h1>
      <h3 className="details-company">{job.company}</h3>
      <p className="details-description">{job.description}</p>

      {/* Affichage du score s'il est disponible */}
      {score !== null && (
        <div className={`score-display ${score >= 70 ? 'text-blue' : 'text-gray'}`}>
          <h3>Score de correspondance : {score}%</h3>
          {score >= 70 ? 
            <p>✅ Excellent profil ! Vous pouvez postuler.</p> : 
            <p>⚠️ Profil un peu juste pour ce poste.</p>
          }
        </div>
      )}

      {/* Input invisible pour déclencher le sélecteur système */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
        accept=".pdf,.doc,.docx"
      />

      <button 
        className={`btn-apply ${score !== null && score < 70 ? 'gray' : 'blue'}`}
        onClick={handleApplyClick}
        disabled={isAnalyzing || (score !== null && score < 70)}
      >
        {isAnalyzing ? "Analyse en cours..." : 
         score !== null ? `Postuler (${score}%)` : "Analyser mon CV"}
      </button>
    </div>
  );
}