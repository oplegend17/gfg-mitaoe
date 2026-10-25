import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, ADMIN_EMAIL } from "../config/firebase.js";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(
    () => onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); }),
    []
  );

  const login = async (email, password) => {
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch {
      setError("Wrong email or password. Check both and try again.");
    }
  };

  const logout = () => signOut(auth);

  // Any authenticated account in this Firebase project is admin (or matches ADMIN_EMAIL if provided)
  const isAdmin = !!user && (!ADMIN_EMAIL || user.email?.toLowerCase() === ADMIN_EMAIL);

  return { user, isAdmin, loading, error, login, logout };
}
