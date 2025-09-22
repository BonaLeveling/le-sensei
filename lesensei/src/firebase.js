import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialisez l'application
const app = initializeApp(firebaseConfig);

// Initialisez les services et les providers
const auth = getAuth(app); // ✅ 'auth' est maintenant défini
const googleProvider = new GoogleAuthProvider();

// Exportez tous les éléments nécessaires
export { auth, googleProvider, app };

console.log("API_KEY:", import.meta.env.VITE_FIREBASE_API_KEY);
