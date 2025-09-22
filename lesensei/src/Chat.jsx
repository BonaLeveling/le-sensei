// Chat.jsx

const sendMessage = async () => {
  if (!input.trim()) return;

  // Créez le message de l'utilisateur
  const userMessage = { from: "user", text: input, avatar: utilisateur };

  // Mettez à jour l'état avec le nouveau message
  const newMessages = [...messages, userMessage];
  setMessages(newMessages);
  setInput("");
  setLoading(true);

  // ✅ Préparez l'historique de la conversation pour l'envoyer
  // Transformez l'historique en un format que le back-end comprend
  const historyForBackend = newMessages.map(msg => ({
      role: msg.from === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
  }));
  
  try {
    const res = await fetch(`${BACK_URL}/serveur`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // ✅ Envoyez l'historique complet et le nouveau message
      body: JSON.stringify({ message: input, history: historyForBackend }),
    });

    const data = await res.json();

    // Ajoutez le message du bot après la réponse
    setMessages(prev => [
      ...prev,
      { from: "Le sensei", text: data.reply || "Pas de réponse disponible.", avatar: perso }
    ]);
  } catch (err) {
    console.error("Erreur fetch :", err);
    setMessages(prev => [...prev, { from: "Le sensei", text: "Erreur réseau, réessaie plus tard.", avatar: perso }]);
  } finally {
    setLoading(false);
  }
};
