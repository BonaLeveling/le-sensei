import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import cors from "cors";

// ⚠️ À n'utiliser qu'en LOCAL. Sur Vercel, les variables sont injectées.
dotenv.config();

const corsMiddleware = cors({
    origin: ['https://le-sensei.vercel.app', 'https://le-sensei-kipc.vercel.app'],
    methods: ["POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
});

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.warn("⚠️ GEMINI_API_KEY n'est pas définie !");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// 🏯 Définition du prompt pour Sensei (inchangé)
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
    
    // ✅ Ajout de sécurité pour l'erreur 500 si la clé est manquante
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ reply: "Erreur de configuration: Clé API manquante." });
    }

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: systemPrompt 
        });

        const chat = model.startChat({
            history: history || [], // 🛑 Correction 1 : S'assurer que history est un tableau (gestion du cas 'undefined')
            generationConfig: { maxOutputTokens: 200 }
        });

        // ✅ Correction 2 : chat.sendMessage prend une chaîne de caractères
        const result = await chat.sendMessage(message); 
        
        // 🛑 Correction 3 : .text est une propriété, pas une fonction dans le SDK moderne
        const reply = result.response.text; 

        res.status(200).json({ reply });
    } catch (error) {
        console.error("Erreur Gemini:", error);
        // Renvoyer le statut 500 pour toute erreur non gérée
        res.status(500).json({ reply: "Erreur côté serveur. Sensei n'a pu répondre pour le moment." });
    }
}