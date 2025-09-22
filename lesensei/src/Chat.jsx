// Chat.jsx
import './input.css';
import './scroll.css';
import { useState, useEffect, useRef } from "react";
import pp5 from './assets/pp5.jpg';
import send from './assets/send.png';
import uparrow from './assets/uparrow.png';
import menu from './assets/menu.png';
import perso from './assets/perso.jpg';
import utilisateur from './assets/utilisateur.png';
import { Link } from "react-router-dom";
import DOMPurify from "dompurify"; // ✅ ajouté


function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [open, setOpen] = useState(false);

  const chatContainerRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Ajouter le message de l'utilisateur
    setMessages([...messages, { from: "user", text: input, avatar: utilisateur }]);
    setInput("");
    setLoading(true); 

    try {
      const res = await fetch("/api/chat-gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();

      // Ajouter le message du bot
      setMessages((prev) => [
        ...prev,
        { from: "Le sensei", text: data.reply || "Pas de réponse disponible.", avatar: perso }
      ]);
      

    } catch (err) {
      console.error("Erreur fetch :", err);
      setMessages((prev) => [...prev, { from: "Le sensei", text: "Erreur réseau, réessaie plus tard.", avatar: perso}]);
    } finally {
      setLoading(false); 
    }
  };

useEffect(() => {
  if (messages.length > 0 && chatContainerRef.current) {
    chatContainerRef.current.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }
}, [messages]);


  const scrollToTop = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="flex flex-col chat-box bg-[url('/bg5.jpg')] h-screen object-cover relative">
      {/* Topbar */}
      <div className='bg-[rgba(255,255,255,0.8)] px-5 py-2 flex justify-between items-center mb-5 w-full'>
        <div className='flex items-center gap-2'>
          <img src={pp5} alt="" className='w-10 h-10 rounded-full sm:w-12 sm:h-12 lg:w-15 lg:h-15'/>
          <div className='flex flex-col'>
            <span className='font-[Rubik_Burned] text-[16px] sm:text-xl'>Le sensei</span>
            <span className='font-[Roboto,sans_serif] text-[10px] sm:text-xs text-[rgba(0,0,0,0.7)]'>Par Bonaventure</span>
          </div>    
        </div>       
        <div>
          <img src={menu} alt="" className='w-8 md:w-10 hover:scale-70 ease-in-out duration-300' onClick={() => setOpen(true)}/>    
        </div>   
        {open && (
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setOpen(false)}/>
        )}            
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-1/3 bg-gray-200 p-6 z-50 transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <ul className="flex flex-col gap-5 text-sm md:text-xl lg:text-lg mt-10 ">
          <li className=' hover:text-[#ee4d4d] ease-in-out duration-300'><Link to="/">Accueil</Link></li>
          <li className='  hover:text-[#ee4d4d] ease-in-out duration-300'><Link to="/chat">Chat</Link></li>
          <li className='  hover:text-[#ee4d4d] '><Link to="/login">Connexion</Link></li>
        </ul>
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="chat-box py-2 px-2 md:px-5 lg:px-10 h-[70vh] w-full overflow-y-auto font-[Sawarabi_Gothic,sans_serif]"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-2 my-2 ${
              msg.from === "user" ? "flex-row" : "flex-row-reverse"
            }`}
          >
            {/* Avatar */}
            <img
              src={msg.avatar}
              alt={msg.from}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full"
            />
            {/* Message */}
            {msg.from === "Le sensei" ? (
              <p
                className="text-black h-auto max-w-120 px-3 py-2 bg-gray-100 rounded-2xl break-words"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.text) }}
              />
            ) : (
              <p
                className="text-white h-auto max-w-120 px-3 py-2 bg-[rgba(0,0,0,0.5)] rounded-xl break-words"
              >
                <b>{msg.from}:</b> {msg.text}
              </p>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-gray-500 flex-row-reverse">
            <span className="flex gap-1 bg-[rgba(0,0,0,0.5)] p-2 rounded-xl absolute bottom-15">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.2s]"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.4s]"></span>
            </span>
          </div> 
        )}
      </div>

      {/* Input */}
      <div className='flex absolute bottom-0 w-full px-5 pb-3'>
        <div className='mx-auto flex justify-center items-center w-full md:w-150 lg:w-200' >
          <input
            name='message'
            id='message'
            placeholder='Message manga...'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
              }
            }}
            className='chat-box flex-grow h-10 bg-[rgba(255,255,255,0.8)] font-semibold border-1 pl-4 pr-10 py-1 md:py-2 w-70 rounded-4xl outline-none break-words sm:w-120 md:w-140'
          />
          <button onClick={sendMessage}>
            <img src={send} alt="" className='w-11 hover:scale-70 ease-in-out duration-300'/>
          </button>                        
        </div>                              
      </div> 

      {/* Scroll to top */}
      <button onClick={scrollToTop}>
        <img src={uparrow} alt="Scroll to top" className='w-8 md:w-10 absolute bottom-30 right-5 hover:-translate-y-5 ease-in-out duration-300'/>
      </button>           
    </div>                
  );
}

export default Chat;

