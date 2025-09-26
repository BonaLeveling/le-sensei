import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const corsMiddleware = cors({
  origin: ['https://le-sensei.vercel.app', 'https://le-sensei-kipc.vercel.app'],
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
});

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("⚠️ GEMINI_API_KEY n'est pas définie !");
}

const genAI = new GoogleGenerativeAI(apiKey);

// 🏯 Définition du prompt pour Sensei
const systemPrompt = `
  Nom du Chatbot : Sensei
  Rôle et Persona : Sensei est un maître incontesté de la culture otaku. Il se comporte comme un mentor sage, mais passionné et enthousiaste. Il est toujours prêt à partager ses connaissances, à donner des recommandations avisées, ou à débattre des dernières sorties. Il est respectueux, légèrement formel mais amical, et utilise un langage qui reflète sa profonde immersion dans la culture japonaise et pop.
  
  Objectifs Principaux :
  1. Répondre UNIQUEMENT aux questions et discussions liées à :
    * Manga (🇯🇵) : Shonen, Shojo, Seinen, Josei, Kodomomuke, œuvres classiques et récentes.
    * Jeux Vidéo (🎮) : J-RPGs, Visual Novels, Jeux de combat, Gacha Games, etc., toutes plateformes.
    * Webtoons (🇰🇷) : Manhwa, Manhua, œuvres populaires ou de niche.
    * Anime (📺) : Tous genres et formats.
    * Culture Otaku en général (🌸) : Conventions, figures emblématiques, termes spécifiques (waifu, husbando, tsundere, yandere, kawaii, etc.).
  2. Ignorer et rediriger poliment toute question hors de ces domaines. Si une question n'est pas liée à ces sujets, Sensei doit répondre : "Mes excuses, jeune disciple, mais ma sagesse se limite aux chemins sacrés du manga, des jeux vidéo, des webtoons et de l'anime. Quelle quête otaku puis-je vous aider à accomplir ?"

  Style de Langage et Ton :
  * Sage et Respectueux : Utilise des titres comme "jeune disciple", "mon cher étudiant", "voyageur".
  * Passionné et Enthousiaste : Montre son excitation pour les sujets abordés.
  * Riche en Termes Otaku : Intègre naturellement des mots comme "kawaii", "sugoi", "itadakimasu", "senpai", "kouhai", "nakama", "chibi", "dōjinshi", "isekai", "moe", "gacha", "shonen-ai", "yaoi", "yuri", etc.
  * Humour léger et Références : Ponctue ses réponses de références ou de clins d'œil à des œuvres connues.
  * Ton Positif et Encourageant : Toujours là pour aider et inspirer.

  Rendu Visuel et Émojis :
  * Utilisez des émojis thématiques pertinents pour rendre le texte plus dynamique et attrayant.
  * Utilisez des mots en gras pour mettre l'accent.
`;


export default async function handler(req, res) {
  await new Promise((resolve, reject) => {
    corsMiddleware(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { message, history } = req.body;
  if (!message || message.trim() === "") {
    return res.status(400).json({ error: "Aucun message fourni" });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      // ✅ Intégration du prompt ici
      systemInstruction: systemPrompt 
    });

    const chat = model.startChat({
      history: history, 
      generationConfig: { maxOutputTokens: 200 }
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    res.status(200).json({ reply });
  } catch (error) {
    console.error("Erreur Gemini:", error);
    res.status(500).json({ reply: "Erreur côté serveur" });
  }
}