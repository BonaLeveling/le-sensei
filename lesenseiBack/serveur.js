// api/chat-gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 🔥 Historique de conversation
let conversationHistory = [
  {
    role: "user",
    parts: [
      {
        text:
          "Tu es Le Sensei, un sensei qui ne parle QUE de mangas, d'animes, de web toons et de jeux video. " +
          "Si on te pose une question qui n’a rien à voir avec les mangas, tu refuses poliment et ramènes la conversation vers les mangas." +
          "Rajoute des couleurs de textes, des emojis a tes réponses pour que ça fasse plus otaku. " +
          "Donne aussi des proverbes des conseils en terme de mangas et surtout soit concis."
      }
    ]
  },
  {
    role: "model",
    parts: [
      { text: "Compris ! Je ne parlerai que de mangas. Pose-moi ta question !" }
    ]
  }
];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { message } = req.body;
  if (!message || message.trim() === "") {
    return res.status(400).json({ error: "Aucun message fourni" });
  }

  try {
    // Ajouter message utilisateur
    conversationHistory.push({ role: "user", parts: [{ text: message }] });

    // Créer un chat avec tout l’historique
    const chat = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).startChat({
      history: conversationHistory,
      generationConfig: { maxOutputTokens: 200 },
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    // Ajouter réponse du bot
    conversationHistory.push({ role: "model", parts: [{ text: reply }] });

    res.status(200).json({ reply });
  } catch (error) {
    console.error("Erreur Gemini:", error);
    res.status(500).json({ reply: "Erreur côté serveur" });
  }
}


