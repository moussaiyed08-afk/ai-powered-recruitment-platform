import { useState } from 'react';

function AddJobForm({ onJobAdded }) {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://localhost:3000/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, company, description }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Impossible d'ajouter l'offre");
      }

      setMessage('💼 Offre d\'emploi publiée avec succès !');
      setTitle('');
      setCompany('');
      setDescription('');
      
      // On prévient le composant parent pour rafraîchir la liste
      if (onJobAdded) onJobAdded();
    } catch (error) {
      setMessage(`❌ Erreur : ${error.message}`);
    }
  };

  return (
    <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #eee', maxWidth: '500px', margin: '20px 0' }}>
      <h4>📢 Publier une nouvelle offre</h4>
      {message && <p style={{ color: message.startsWith('❌') ? 'red' : 'green' }}>{message}</p>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input 
          type="text" 
          placeholder="Titre du poste (ex: Développeur JavaScript)" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input 
          type="text" 
          placeholder="Entreprise (ex: My Company Tunisia)" 
          value={company} 
          onChange={(e) => setCompany(e.target.value)} 
          required 
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <textarea 
          placeholder="Description du poste, compétences requises..." 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          required 
          rows="4"
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
        />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          Ajouter l'offre
        </button>
      </form>
    </div>
  );
}

export default AddJobForm;