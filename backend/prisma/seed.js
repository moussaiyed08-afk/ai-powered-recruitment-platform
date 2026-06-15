const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Début du seeding... 🌱");

  // On nettoie la base de données avant pour éviter les doublons
  await prisma.job.deleteMany();

  // On insère nos fausses offres d'emploi
  const job1 = await prisma.job.create({
    data: {
      title: "Développeur Full-Stack React/Express",
      company: "TechCorp Tunisia",
      description: "Nous recherchons un stagiaire passionné pour propulser notre plateforme de recrutement IA. Télétravail partiel.",
    },
  });

  const job2 = await prisma.job.create({
    data: {
      title: "Ingénieur IA / NLP",
      company: "InnovAI",
      description: "Rejoigne  notre équipe pour travailler sur l'intégration de modèles GPT et le scoring automatique de CV.",
    },
  });

  console.log(`Données insérées avec succès : \n- ${job1.title}\n- ${job2.title}`);
}

main()
  .catch((e) => {
    console.error("Erreur lors du seeding :", e);
    process.exit(1);
  })
  .finally(async () => {
    // Très important : On ferme la connexion à la base de données à la fin
    await prisma.$disconnect();
  });