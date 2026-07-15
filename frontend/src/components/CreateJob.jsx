import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateJob() {
  const navigate = useNavigate();
  
  // On garde le formulaire mais on simplifie le rendu pour le test
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'CDI',
    contract: 'Temps plein',
    location: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Données :", formData);
    navigate('/');
  };

  return (
    <div className="create-job-container">
      <h2>Test : Création d'offre</h2>
      <button onClick={() => navigate('/')}>Retour</button>
      
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Titre"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
        />
        <button type="submit">Valider</button>
      </form>
    </div>
  );
}

export default CreateJob;