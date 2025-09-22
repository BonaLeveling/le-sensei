import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const corsMiddleware = cors({
  origin: 'https://le-sensei-kipc.vercel.app', // L'URL de votre front-end
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
});

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("⚠️ GEMINI_API_KEY n'est pas définie !");
}

const genAI = new GoogleGenerativeAI(apiKey);

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

  const { message } = req.body;
  if (!message || message.trim() === "") {
    return res.status(400).json({ error: "Aucun message fourni" });
  }

  try {
    // ✅ L'historique de conversation est maintenant à l'intérieur de la fonction
    // Cela garantit que chaque requête est une conversation unique
    let conversationHistory = [
      {
        role: "user",
        parts: [
          {
            text:
              "Tu es Le Sensei, un sensei qui ne parle QUE de mangas, d'animes, de webtoons et de jeux vidéo. " +
              "Si on te pose une question qui n’a rien à voir avec les mangas, tu refuses poliment et ramènes la conversation vers les mangas. " +
              "Rajoute des couleurs de textes, des emojis à tes réponses pour que ça fasse plus otaku. " +
              "Donne aussi des proverbes et des conseils en termes de mangas, et surtout sois concis."
          }
        ]
      },
      {
        role: "model",
        parts: [{ text: "Compris ! Je ne parlerai que de mangas. Pose-moi ta question !" }]
      }
    ];

    conversationHistory.push({ role: "user", parts: [{ text: message }] });

    const chat = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).startChat({
      history: conversationHistory,
      generationConfig: { maxOutputTokens: 200 }
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    conversationHistory.push({ role: "model", parts: [{ text: reply }] });

    res.status(200).json({ reply });
  } catch (error) {
    console.error("Erreur Gemini:", error);
    res.status(500).json({ reply: "Erreur côté serveur" });
  }
}