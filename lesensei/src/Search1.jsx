import './input.css';
import { useState } from "react";

function Search1() {
  const [input, setInput] = useState("");
  const [animeResults, setAnimeResults] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  const BACK_URL = process.env.REACT_APP_BACK_URL;

  // Fonction pour lancer la recherche
  const handleSearch = async () => {
    if (!input.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`https://le-sensei-o9za.vercel.app/api/search-anime`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });

      const data = await res.json();
      setAnimeResults(data.results || []);
      setShowPopup(true); // afficher le pop-up
    } catch (err) {
      console.error(err);
      setAnimeResults([]);
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Barre de recherche */}
      <div className='flex h-full items-center justify-center text-xs md:text-sm'>
        <div className='text-white font-[Roboto,sans_serif] flex gap-1 md:gap-2'>
          <input
            type="text"
            placeholder='Rechercher...'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
            className='bg-[rgba(0,0,0,0.5)] border px-3 md:px-4 py-2 w-60 md:w-96 lg:w-[400px] rounded-full outline-none '
          />
          <button
            onClick={handleSearch}
            className='bg-black px-4 py-2 rounded-full hover:-translate-y-1 hover:bg-gray-800 transition-all duration-300'
          >
            Rechercher
          </button>
        </div>
      </div>

      {/* Pop-up des résultats */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-start pt-20 z-50">
          <div className="bg-white rounded-xl p-6 w-11/12 md:w-2/3 lg:w-1/2 max-h-[80vh] overflow-y-auto relative shadow-lg">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-3 right-3 text-xl font-bold"
              aria-label="Fermer"
              role="dialog"
              aria-modal="true"
            >
              ×
            </button>

            {loading ? (
              <p className="text-center text-gray-700">Chargement...</p>
            ) : animeResults.length === 0 ? (
              <p className="text-center text-gray-700">Aucun anime trouvé.</p>
            ) : (
              animeResults.map((anime, i) => (
                <div key={i} className="mb-4 flex gap-4 items-start hover:bg-gray-100 p-2 rounded transition">
                  <img src={anime.image} alt={anime.title} className="w-16 h-20 rounded-lg object-cover"/>
                  <div>
                    <h3 className="font-bold text-gray-900">{anime.title}</h3>
                    <p className="text-sm text-gray-700">
                      {anime.synopsis
                        ? anime.synopsis.substring(0, 150) + "..."
                        : "Pas de synopsis disponible"}
                    </p>
                    <a href={anime.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline text-sm">Voir sur MAL</a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Search1;
