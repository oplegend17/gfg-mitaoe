import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || "").toLowerCase();
export const PUBLIC_URL =
  import.meta.env.VITE_PUBLIC_URL || (typeof window !== "undefined" ? window.location.origin : "");

export const EVENT = {
  title: "Flo101 Campus Session",
  tagline: "Learn • Practice • Build",
  subtitle: "Your AI-powered learning & building partner",
  chapter: "Campus Body",
  college: "MITAOE",
  date: "29 Oct 2026",
  day: "Thursday",
  time: "5:00 PM onwards",
  venue: "D109, MITAOE",
  perk: "Free Access worth $200+",
};
