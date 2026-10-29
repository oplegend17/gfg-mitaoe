import { useCallback, useEffect, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../config/firebase.js";

export function useAttendanceAdmin(enabled) {
  const [count, setCount] = useState(0);
  const [attendees, setAttendees] = useState([]);
  const [open, setOpen] = useState(null); // null = not loaded yet
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled) return undefined;

    // Listen to all attendance records in real time, ordered by most recent first
    const unsubAttendees = onSnapshot(
      query(collection(db, "attendance"), orderBy("createdAt", "desc")),
      (snap) => {
        const list = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name || "Anonymous",
            email: data.email || "—",
            branch: data.branch || "—",
            year: data.year || "—",
            feedback: data.feedback || "",
            at: data.createdAt?.toDate?.() ?? null,
          };
        });
        setAttendees(list);
        setCount(snap.size);
      },
      (e) => setError(e.message)
    );

    // Listen to session status
    const unsubSession = onSnapshot(
      doc(db, "config", "session"),
      (snap) => setOpen(snap.exists() ? snap.data().open === true : false),
      (e) => setError(e.message)
    );

    return () => {
      unsubAttendees();
      unsubSession();
    };
  }, [enabled]);

  const setSessionOpen = useCallback(async (value) => {
    await setDoc(doc(db, "config", "session"), { open: value, updatedAt: serverTimestamp() }, { merge: true });
  }, []);

  const resetCount = useCallback(async () => {
    const snap = await getDocs(collection(db, "attendance"));
    let batch = writeBatch(db);
    let countInBatch = 0;
    for (const d of snap.docs) {
      batch.delete(d.ref);
      countInBatch += 1;
      if (countInBatch === 400) {
        await batch.commit();
        batch = writeBatch(db);
        countInBatch = 0;
      }
    }
    if (countInBatch > 0) {
      await batch.commit();
    }

    // Clean reset: update session with resetAt so student phones clear their previous 'already counted' cache
    await setDoc(
      doc(db, "config", "session"),
      {
        resetAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // Immediately clear local state in admin UI
    setAttendees([]);
    setCount(0);
  }, []);

  return { count, attendees, open, error, setSessionOpen, resetCount };
}
