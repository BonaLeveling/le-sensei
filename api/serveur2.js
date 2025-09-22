// api/search-anime.js

import fetch from "node-fetch";
import cors from "cors";

// Initialisez le middleware CORS
const corsMiddleware = cors({
  origin: ['https://le-sensei.vercel.app','https://le-sensei-kipc.vercel.app'], // L'origine de votre front-end
  methods: ["POST", "OPTIONS"], // Méthodes HTTP autorisées
  allowedHeaders: ["Content-Type"], // En-têtes autorisés
});

export default async function handler(req, res) {
  // Exécutez le middleware CORS
  await new Promise((resolve, reject) => {
    corsMiddleware(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });

  // Gérez la requête de pré-vérification (OPTIONS)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Gérez la requête principale (POST)
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { query } = req.body;
  if (!query || query.trim() === "") {
    return res.status(400).json({ error: "Aucun query fourni" });
  }

  try {
    const response = await fetch(
      `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5`
    );

    if (!response.ok) {
      throw new Error(`Erreur de l'API Jikan : ${response.status}`);
    }

    const data = await response.json();

    const results = (data.data || []).map((anime) => ({
      title: anime.title,
      url: anime.url,
      image: anime.images?.jpg?.image_url || "",
      synopsis: anime.synopsis || "Pas de synopsis disponible",
    }));

    res.status(200).json({ results });
  } catch (err) {
    console.error("Erreur API Jikan:", err.message);
    res.status(500).json({ error: "Erreur API Jikan" });
  }
}