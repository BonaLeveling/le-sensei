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

  // ✅ Récupère l'historique et le nouveau message du front-end
  const { message, history } = req.body;
  if (!message || message.trim() === "") {
    return res.status(400).json({ error: "Aucun message fourni" });
  }

  try {
    const chat = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).startChat({
      history: history, // ✅ Utilise l'historique fourni par le front-end
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