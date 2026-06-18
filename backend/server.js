const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = "mon_secret_tres_securise";
// Remplace const PORT = process.env.PORT || 3000; par ceci :
// Remplace toute la ligne const PORT = ... par ceci :
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Inscription complète
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, role, nom, prenom, entreprise, enChomage } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await prisma.user.create({
      data: { 
        email, 
        password: hashedPassword, 
        role,
        nom,
        prenom,
        entreprise: role === 'RECRUTEUR' ? entreprise : null,
        enChomage: role === 'CANDIDAT' ? !!enChomage : false
      }
    });
    res.status(201).json({ message: "Utilisateur créé avec succès !" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'inscription." });
  }
});

// Connexion
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Identifiants invalides." });
    }
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
    res.json({ token, user: { email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: "Erreur de connexion." });
  }
});
app.get('/api/jobs', async (req, res) => {
  try {
    // Prisma utilise le nom du modèle : prisma.job
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(jobs); 
  } catch (error) {
    res.status(500).json({ error: "Impossible de récupérer les jobs" });
  }
});
// Route pour ajouter un job (pour le Recruteur)
app.post('/api/jobs', async (req, res) => {
  try {
    const { title, company, description } = req.body;
    const newJob = await prisma.job.create({
      data: { 
        title, 
        company, 
        description 
      }
    });
    res.status(201).json(newJob);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la création de l'offre" });
  }
});
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    
    // Si l'ID n'est pas un nombre valide
    if (isNaN(jobId)) {
      return res.status(400).json({ error: "ID invalide" });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    // Si le job n'est pas trouvé, renvoie 404 proprement
    if (!job) {
      return res.status(404).json({ error: "Offre non trouvée" });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});
app.put('/api/jobs/:id', async (req, res) => {
  try {
    const { title, company, description } = req.body;
    const updatedJob = await prisma.job.update({
      where: { id: parseInt(req.params.id) },
      data: { title, company, description }
    });
    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ error: "Erreur de mise à jour" });
  }
});
app.listen(PORT, () => console.log(`🚀 Serveur sur http://localhost:${PORT}`));