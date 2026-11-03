import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase.js";

/**
 * Public hook to listen to the live results publish status from Firestore /config/session
 */
export function useResultsStatus() {
  const [resultsPublished, setResultsPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Safety fallback so UI doesn't hang in loading state if network is slow
    const fallbackTimer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    const unsub = onSnapshot(
      doc(db, "config", "session"),
      (snap) => {
        clearTimeout(fallbackTimer);
        if (snap.exists()) {
          const data = snap.data();
          setResultsPublished(data.resultsPublished === true);
        } else {
          setResultsPublished(false);
        }
        setLoading(false);
      },
      (err) => {
        clearTimeout(fallbackTimer);
        console.error("Results status listener error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(fallbackTimer);
      unsub();
    };
  }, []);

  return { resultsPublished, loading, error };
}
