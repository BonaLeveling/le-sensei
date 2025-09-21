// api/search-anime.js
import fetch from "node-fetch"; // si Node <18

export default async function handler(req, res) {
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
      throw new Error(`Jikan API error: ${response.status}`);
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
    console.error("Erreur Jikan API:", err.message);
    res.status(500).json({ error: "Erreur Jikan API" });
  }
}
