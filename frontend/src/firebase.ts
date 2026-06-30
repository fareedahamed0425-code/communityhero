import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC4x9Gf4t_IXf2iJRl035iklr1aJ18RWuI",
  authDomain: "apollo-hemodialysis-management.firebaseapp.com",
  projectId: "apollo-hemodialysis-management",
  storageBucket: "apollo-hemodialysis-management.firebasestorage.app",
  messagingSenderId: "107751276849",
  appId: "1:107751276849:web:bd47b9ba0201cf98e47010",
  measurementId: "G-8XS8EH1LCD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
