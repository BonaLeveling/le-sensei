import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "./gsapConfig";
import logo from './assets/logo.png';
import menuBlanc from './assets/menuBlanc.png';
import './input.css';

function Navbar() {
  const logoRef = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (logoRef.current) {
      const letters = logoRef.current.querySelectorAll(".letter");
      gsap.fromTo(
        letters,
        { opacity: 0, y: -20, scale: 0.8 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.1,
          duration: 0.8,
          delay: 0.5,
          ease: "bounce",
        }
      );
    }
  }, []);

  return (
    <nav>
      <div className="flex justify-between items-center px-5 py-2 text-white absolute w-full">
        {/* Logo animé */}
        <div className="flex items-center">
          <img src={logo} alt="Logo le sensei" className="w-8 md:w-10" />
          <span
            ref={logoRef}
            className="ml-2 font-rubik text-sm md:text-xl whitespace-nowrap"
          >
            {"Le sensei.".split("").map((char, i) => (
              <span key={i} className="inline-block letter">
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </span>
        </div>

        {/* Menu desktop */}
        <div className="font-Roboto hidden md:flex md:gap-5 md:ml-auto">
          <Link
            to="/chat"
            className="font-rubik text-2xl hover:text-[rgba(255,255,255,0.8)] ease-in-out duration-300"
          >
            Chat
          </Link>
          <Link
            to="/signin"
            className="bg-black px-4 py-1 rounded-3xl hover:-translate-y-1 ease-in-out duration-300"
          >
            S'inscrire
          </Link>
          <Link
            to="/login"
            className="border px-4 py-1 rounded-3xl text-white hover:-translate-y-1 duration-300"
          >
            Se connecter
          </Link>
        </div>

        {/* Bouton burger (mobile) */}
        <div className="md:hidden">
          <img
            src={menuBlanc}
            alt="menu"
            className="w-10 hover:-translate-y-1 ease-in-out duration-300 cursor-pointer"
            onClick={() => setOpen(true)}
          />
        </div>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar mobile */}
      <div
        className={`fixed top-0 left-0 h-full w-1/3 bg-gray-900 text-white p-5 z-50 transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <ul className="flex flex-col gap-5 text-sm mt-10">
          <li className="hover:text-[#ee4d4d] ease-in-out duration-300">
            <Link to="/" onClick={() => setOpen(false)}>Accueil</Link>
          </li>
          <li  className="hover:text-[#ee4d4d] ease-in-out duration-300">
            <Link to="/chat" onClick={() => setOpen(false)}>Chat</Link>
          </li>
          <li  className="hover:text-[#ee4d4d] ease-in-out duration-300">
            <Link to="/signin" onClick={() => setOpen(false)}>S'inscrire</Link>
          </li>
          <li  className="hover:text-[#ee4d4d] ease-in-out duration-300">
            <Link to="/login" onClick={() => setOpen(false)}>Se connecter</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
