import "./input.css";
import logo from "./assets/logo.png";
import { useEffect, useRef } from "react";
import { gsap } from "./gsapConfig";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase.js";


function Login () {
    const logoRef = useRef(null);

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
        });
      }
    }, []);
    const navigate = useNavigate();

    const loginWithGoogle = async () => {
        try {
        const result = await signInWithPopup(auth, googleProvider);
        console.log("Utilisateur Google :", result.user);
        navigate("/");
    } catch (err) {
      console.error(err);
    }
    };
    return (
        <div className='flex h-screen'>
            <div className='w-full lg:w-1/2 h-full flex flex-col items-center justify-center bg-white'>

                    <Link to="/" className='flex items-center hover:-translate-y-1 ease-in-out duration-300'>
                        <img src={logo} alt="Logo le sensei" className='w-8 md:w-10' />
                        <span ref={logoRef} className="ml-2 font-rubik text-sm whitespace-nowrap md:text-xl" >
                        {"Le sensei.".split("").map((char, i) => (
                        <span key={i} className="inline-block letter">
                            {char === " " ? "\u00A0" : char}
                        </span>
                        ))}
                        </span>
                    </Link>
                    <form action="#" className='flex flex-col w-3/4 max-w-md font-Roboto mt-2 text-sm lg:mt-8'>
                    <input type="text" name='pseudo'  placeholder='Pseudo' className='border-2 px-4 py-1 my-1 rounded-3xl lg:py-2 md:my-2'/>
                    <input type="password" name='password'  placeholder='Mot de passe' className='border-2 px-4 py-1 my-1 rounded-3xl lg:py-2 md:my-2'/>
                    <div className=' mt-3 lg:mt-8'>
                        <input type="checkbox" name='validation' id='validation'className='middle mr-2 w-4'/>
                        <label htmlFor="validation" className="text-black mt-1 text-sm mx-auto">Accepter nos conditions d'itulisation</label>
                    </div>
                    <input type="submit" name='Sinscrire' value="Se connecter" className='bg-black rounded-3xl text-white py-1 mt-2 lg:py-2 lg:mt-4 hover:-translate-y-1 ease-in-out duration-300' />
                    <button onClick={loginWithGoogle} className="bg-red-500 text-white py-1 lg:py-2 rounded-3xl mt-2 hover:-translate-y-1 ease-in-out duration-300">
                        connexion avec Google
                    </button>

                </form>
                <Link to='/signin' className='text-[#BDBDBD] mt-1 lg:mt-2 text-sm mx-auto hover:underline'>S'inscrire</Link>    
            </div>
            <div className='lg:w-1/2 lg:h-full'>
                <img src="bg9.jpeg" alt="" className="hidden lg:inline-block lg:w-full lg:h-full lg:object-cover" />
            </div>
        </div>
    )
}
export default Login