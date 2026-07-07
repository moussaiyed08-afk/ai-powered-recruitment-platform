require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OpenAI } = require("openai"); 
const nodemailer = require('nodemailer'); // <--- AJOUT

const app = express();
const prisma = new PrismaClient();

const JWT_SECRET = "mon_secret_tres_securise";
const PORT = process.env.PORT || 5000;

// Configuration du transporteur Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Mets ton email dans le fichier .env
    pass: process.env.EMAIL_PASS  // Mets ton mot de passe d'application dans .env
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --- FONCTION CALCUL SCORE ---
async function calculateScore(jobDescription, cvContent) {
  try {
    const truncatedCv = cvContent.substring(0, 8000); 
    const client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1"
    });

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "Tu es un expert en recrutement. Réponds EXCLUSIVEMENT avec un nombre entier entre 0 et 100." },
        { role: "user", content: `Offre: ${jobDescription.substring(0, 2000)}\n\nCV: ${truncatedCv}\n\nDonne le score:` }
      ],
      temperature: 0.1,
      max_tokens: 5
    });

    const score = parseInt(completion.choices[0].message.content.replace(/[^0-9]/g, ''));
    return isNaN(score) ? 50 : score;
  } catch (err) {
    console.error("Erreur Llama/Groq :", err);
    return 50;
  }
}

// --- ROUTE DE CANDIDATURE AVEC IA + EMAIL ---
app.post('/api/apply/:id', async (req, res) => {
    const { cvBase64, fileName } = req.body;
    const jobId = parseInt(req.params.id);

    try {
        // 1. Jointure pour récupérer l'email du recruteur
        const job = await prisma.job.findUnique({ 
            where: { id: jobId },
            include: { recruiter: true } 
        });
        
        if (!job) return res.status(404).json({ error: "Job non trouvé" });

        const score = await calculateScore(job.description, cvBase64);

        // 2. Enregistrement
        const nouvelleCandidature = await prisma.candidature.create({
            data: {
                fileName: fileName,
                cvContent: cvBase64,
                jobId: jobId,
                score: score 
            }
        });
        
        // 3. Envoi de l'email au recruteur
        if (job.recruiter && job.recruiter.email) {
            const mailOptions = {
              from: process.env.EMAIL_USER,
              to: job.recruiter.email,
              subject: `Nouvelle candidature pour : ${job.title}`,
              text: `Bonjour, un candidat a postulé pour votre offre "${job.title}". Score de correspondance : ${score}%.\nFichier : ${fileName}`
            };

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) console.error("Erreur envoi email:", error);
              else console.log("Email envoyé au recruteur :", job.recruiter.email);
            });
        }

        res.status(200).json({ 
            message: "Candidature traitée", 
            score: score,
            candidatureId: nouvelleCandidature.id 
        });
    } catch (error) {
        console.error("Erreur traitement :", error);
        res.status(500).json({ error: "Erreur lors du traitement." });
    }
});

// ... (Garde tes autres routes Auth et Jobs intactes) ...

app.listen(PORT, () => console.log(`🚀 Serveur sur http://localhost:${PORT}`));