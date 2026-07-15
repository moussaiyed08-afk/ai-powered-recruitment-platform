require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OpenAI } = require("openai"); 
const nodemailer = require('nodemailer');

const app = express();
const prisma = new PrismaClient();

const JWT_SECRET = "mon_secret_tres_securise";
const PORT = process.env.PORT || 5000;

// Configuration du transporteur Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --- ROUTES AUTHENTIFICATION ---
app.post('/api/auth/register', async (req, res) => {
    const { nom, prenom, email, password, role, entreprise, enChomage } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { nom, prenom, email, password: hashedPassword, role, entreprise, enChomage }
        });
        res.status(201).json({ message: "Utilisateur créé avec succès" });
    } catch (error) {
        console.error("Erreur inscription :", error);
        res.status(400).json({ error: "Erreur lors de l'inscription" });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Email ou mot de passe incorrect" });
        }
        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur lors de la connexion" });
    }
});

// --- ROUTE POUR RÉCUPÉRER TOUTES LES OFFRES ---
app.get('/api/jobs', async (req, res) => {
    try {
        const jobs = await prisma.job.findMany({ include: { recruiter: true } });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: "Impossible de récupérer les offres" });
    }
});

// --- ROUTE POUR RÉCUPÉRER UNE SEULE OFFRE (AVEC LOGS) ---
app.get('/api/jobs/:id', async (req, res) => {
    const { id } = req.params;
    console.log("Recherche de l'offre avec l'ID reçu :", id); 
    
    try {
        const job = await prisma.job.findUnique({
            where: { id: parseInt(id) },
            include: { recruiter: true }
        });
        
        if (!job) {
            console.log("Offre non trouvée en base pour l'ID :", id);
            return res.status(404).json({ error: "Offre non trouvée" });
        }
        
        res.json(job);
    } catch (error) {
        console.error("Erreur serveur :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// --- ROUTE POUR MODIFIER UNE OFFRE ---
app.put('/api/jobs/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, type, contract, location, status } = req.body;
    
    try {
        const updatedJob = await prisma.job.update({
            where: { id: parseInt(id) },
            data: { 
                title, 
                description, 
                type, 
                contract, 
                location, 
                status 
            }
        });
        
        res.json({ message: "Offre mise à jour avec succès", updatedJob });
    } catch (error) {
        console.error("Erreur lors de la mise à jour :", error);
        res.status(500).json({ error: "Erreur serveur lors de la mise à jour" });
    }
});

// --- ROUTE POUR SUPPRIMER UNE OFFRE (TRANSACTION SÉCURISÉE) ---
app.delete('/api/jobs/:id', async (req, res) => {
    const { id } = req.params;
    const jobId = parseInt(id);
    
    try {
        // Utilisation d'une transaction pour garantir l'ordre des opérations
        await prisma.$transaction([
            // 1. On supprime toutes les candidatures liées au jobId
            prisma.candidature.deleteMany({
                where: { jobId: jobId }
            }),
            // 2. Ensuite, on supprime l'offre
            prisma.job.delete({
                where: { id: jobId }
            })
        ]);
        
        res.json({ message: "Offre et candidatures supprimées avec succès" });
    } catch (error) {
        console.error("Erreur critique lors de la suppression :", error);
        res.status(500).json({ error: "Erreur lors de la suppression en base de données" });
    }
});

// --- ROUTE DE CANDIDATURE AVEC IA + EMAIL (SIMPLE) ---
app.post('/api/apply/:id', async (req, res) => {
    const { cvBase64, fileName } = req.body;
    const jobId = parseInt(req.params.id);

    try {
        const job = await prisma.job.findUnique({ 
            where: { id: jobId },
            include: { recruiter: true } 
        });
        
        if (!job) return res.status(404).json({ error: "Job non trouvé" });

        const score = await calculateScore(job.description, cvBase64);

        const nouvelleCandidature = await prisma.candidature.create({
            data: { fileName, cvContent: cvBase64, jobId, score }
        });
        
        if (job.recruiter?.email) {
            try {
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: job.recruiter.email,
                    subject: `Nouvelle candidature pour : ${job.title}`,
                    text: `Bonjour, un candidat a postulé pour votre offre "${job.title}".\n\nScore de correspondance : ${score}%.\nFichier : ${fileName}`
                });
                console.log("✅ Email envoyé avec succès !");
            } catch (mailError) {
                console.error("❌ ERREUR LORS DE L'ENVOI DU MAIL :", mailError);
            }
        }

        res.status(200).json({ message: "Candidature traitée", score, candidatureId: nouvelleCandidature.id });
    } catch (error) {
        console.error("Erreur traitement :", error);
        res.status(500).json({ error: "Erreur lors du traitement." });
    }
});

// --- FONCTION CALCUL SCORE ---
async function calculateScore(jobDescription, cvContent) {
    try {
        const client = new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: "https://api.groq.com/openai/v1" });
        const completion = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "Expert recruteur. Réponds uniquement avec un nombre entre 0 et 100." },
                { role: "user", content: `Offre: ${jobDescription.substring(0, 2000)}\n\nCV: ${cvContent.substring(0, 8000)}\n\nDonne le score:` }
            ],
            temperature: 0.1,
            max_tokens: 5
        });
        const score = parseInt(completion.choices[0].message.content.replace(/[^0-9]/g, ''));
        return isNaN(score) ? 50 : score;
    } catch (err) {
        return 50;
    }
}

app.listen(PORT, () => console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`));