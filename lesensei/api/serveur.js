import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import cors from "cors";

// ⚠️ À n'utiliser qu'en LOCAL. Sur Vercel, les variables sont injectées.
dotenv.config();

const corsMiddleware = cors({
    // Laissez origin pour définir la politique CORS
    origin: ['https://le-sensei.vercel.app', 'https://le-sensei-kipc.vercel.app'],
    methods: ["POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
});

// 🔑 Utiliser le nom de variable d'environnement défini sur la plateforme
const apiKey = process.env.GEMINI_API_KEY; 

if (!apiKey) {
    console.warn("⚠️ GEMINI_API_KEY n'est pas définie dans l'environnement !");
}

// 🌐 Initialisation du SDK (devrait se produire une seule fois)
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
    // 1. Gestion du CORS
    await new Promise((resolve, reject) => {
        corsMiddleware(req, res, (result) => {
            if (result instanceof Error) {
                // Pourrait potentiellement causer l'erreur 500 si la validation CORS échoue de manière inattendue.
                return reject(result);
            }
            resolve(result);
        });
    });

    // 2. Gestion des méthodes HTTP
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Méthode non autorisée" });
    }

    // 3. Validation de l'entrée et de la clé API
    const { message, history } = req.body;
    
    if (!message || message.trim() === "") {
        return res.status(400).json({ error: "Aucun message fourni" });
    }
    
    // Ajout de sécurité pour l'erreur 500 si la clé est manquante
    if (!apiKey) {
        console.error("Clé API Gemini manquante. Impossible de traiter la requête.");
        return res.status(500).json({ reply: "Erreur de configuration du serveur : Clé API manquante." });
    }

    // 4. Appel à l'API Gemini
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            // ✅ Utilisation du prompt system pour définir le rôle du Sensei
            systemInstruction: systemPrompt 
        });

        const chat = model.startChat({
            history: history || [] // S'assurer que history est toujours un tableau
        });

        // 🛑 CORRECTION 1 : chat.sendMessage prend une chaîne, pas un objet {message}
        const result = await chat.sendMessage(message);
        
        // 🛑 CORRECTION 2 : .text est une propriété, pas une méthode/fonction dans le SDK moderne
        const reply = result.response.text; 

        res.status(200).json({ reply });
        
    } catch (error) {
        // Cette erreur est la source de votre 500 si elle provient de Gemini (ex: clé invalide, limite dépassée)
        console.error("Erreur Gemini (la source probable de votre 500) :", error);
        res.status(500).json({ reply: "Erreur côté serveur. Sensei n'a pu répondre pour le moment. Veuillez vérifier la console du serveur pour les détails de l'API." });
    }
}