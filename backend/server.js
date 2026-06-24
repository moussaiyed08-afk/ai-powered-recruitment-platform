require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const prisma = new PrismaClient();

const JWT_SECRET = "mon_secret_tres_securise";
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --- FONCTION CALCUL SCORE (VERSION FINALE) ---
async function calculateScore(jobDescription, cvContent) {
  try {
    const prompt = `Tu es un expert en recrutement. Compare ce CV et cette offre.
    Offre: ${jobDescription}
    CV: ${cvContent}
    Réponds EXCLUSIVEMENT avec un nombre entier entre 0 et 100. Ne mets aucun texte, aucune explication.`;

    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.2-1B-Instruct",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 10,
        temperature: 0.1
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erreur API finale :", JSON.stringify(data, null, 2));
      return 50; // Valeur par défaut si l'API échoue
    }

    const text = data.choices[0].message.content;
    const score = parseInt(text.replace(/[^0-9]/g, ''));
    
    return isNaN(score) ? 50 : score;
  } catch (err) {
    console.error("Erreur fatale calculateScore :", err);
    return 0;
  }
}

// --- ROUTE DE CANDIDATURE AVEC IA ---
app.post('/api/apply/:id', async (req, res) => {
    const { cvBase64, fileName } = req.body;
    const jobId = parseInt(req.params.id);

    try {
        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) return res.status(404).json({ error: "Job non trouvé" });

        const score = await calculateScore(job.description, cvBase64);
        console.log(`Score final calculé pour ${fileName} : ${score}%`);

        const nouvelleCandidature = await prisma.candidature.create({
            data: {
                fileName: fileName,
                cvContent: cvBase64,
                jobId: jobId,
                score: score 
            }
        });
        
        res.status(200).json({ 
            message: "Candidature traitée", 
            score: score,
            candidatureId: nouvelleCandidature.id 
        });
    } catch (error) {
        console.error("Erreur d'enregistrement Prisma :", error);
        res.status(500).json({ error: "Erreur lors du traitement." });
    }
});

// --- ROUTES AUTHENTIFICATION ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, role, nom, prenom, entreprise, enChomage } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword, role, nom, prenom, entreprise: role === 'RECRUTEUR' ? entreprise : null, enChomage: role === 'CANDIDAT' ? !!enChomage : false }
    });
    res.status(201).json({ message: "Utilisateur créé avec succès !" });
  } catch (error) { res.status(500).json({ error: "Erreur inscription." }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: "Identifiants invalides." });
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
    res.json({ token, user: { email: user.email, role: user.role } });
  } catch (error) { res.status(500).json({ error: "Erreur de connexion." }); }
});

// --- ROUTES JOBS ---
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(jobs); 
  } catch (error) { res.status(500).json({ error: "Impossible de récupérer les jobs" }); }
});

app.post('/api/jobs', async (req, res) => {
  try {
    const { title, company, description } = req.body;
    const newJob = await prisma.job.create({ data: { title, company, description } });
    res.status(201).json(newJob);
  } catch (error) { res.status(500).json({ error: "Erreur création offre" }); }
});

app.get('/api/jobs/:id', async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return res.status(404).json({ error: "Offre non trouvée" });
    res.json(job);
  } catch (error) { res.status(500).json({ error: "Erreur serveur" }); }
});

app.listen(PORT, () => console.log(`🚀 Serveur sur http://localhost:${PORT}`));