import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './JobDetails.css';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [score, setScore] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [loading, setLoading] = useState(true); // État de chargement
  const [error, setError] = useState(null); // État pour gérer les erreurs
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchJob = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/jobs/${id}`);
            
            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: L'offre n'existe pas.`);
            }

            const data = await response.json();
            setJob(data);
            setError(null);
        } catch (error) {
            console.error("Erreur chargement :", error);
            setError("Impossible de charger l'offre.");
        } finally {
            setLoading(false);
        }
    };
    fetchJob();
  }, [id]);

  const handleApplyClick = () => {
    if (score >= 70) {
      setIsApplied(true);
    } else {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsAnalyzing(true);
    const reader = new FileReader();
    
    reader.onloadend = async () => {
      const payload = { cvBase64: reader.result, fileName: file.name };

      try {
        const res = await axios.post(`http://localhost:5000/api/apply/${id}`, payload);
        setScore(res.data.score); 
      } catch (err) {
        console.error("Erreur lors de l'analyse :", err.message);
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Affichage conditionnel selon le statut
  if (loading) return <p className="details-loading">Chargement des détails...</p>;
  if (error) return <p className="details-error" style={{color: 'red'}}>❌ {error}</p>;
  if (!job) return <p>Aucune offre trouvée.</p>;

  return (
    <div className="details-container">
      <button className="btn-back" onClick={() => navigate(-1)}>← Retour</button>
      <h1 className="details-title">{job.title}</h1>
      <h3 className="details-company">{job.company}</h3>
      <p className="details-description">{job.description}</p>

      {score !== null && (
        <div className={`score-display ${score >= 70 ? 'text-blue' : 'text-gray'}`}>
          <h3>Score de correspondance : {score}%</h3>
          {score >= 70 ? <p>✅ Excellent profil ! Vous pouvez postuler.</p> : <p>⚠️ Profil un peu juste.</p>}
        </div>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
        accept=".pdf,.doc,.docx"
      />

      <button 
        className={`btn-apply ${isAnalyzing ? 'loading' : ''} ${isApplied ? 'success' : ''} ${score !== null && score < 70 ? 'gray' : 'blue'}`}
        onClick={handleApplyClick}
        disabled={isAnalyzing || isApplied || (score !== null && score < 70)}
      >
        {isApplied ? (
          "✅ Candidature envoyée !" 
        ) : isAnalyzing ? (
          <>
            <span className="spinner-icon"></span> Analyse en cours...
          </>
        ) : (
          score !== null ? `Postuler (${score}%)` : "Analyser mon CV"
        )}
      </button>
    </div>
  );
}