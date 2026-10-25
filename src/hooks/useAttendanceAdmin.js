import { useCallback, useEffect, useState } from "react";
import {
  collection, doc, getDocs, limit, onSnapshot, orderBy, query,
  serverTimestamp, setDoc, writeBatch,
} from "firebase/firestore";
import { db } from "../config/firebase.js";

export function useAttendanceAdmin(enabled) {
  const [count, setCount] = useState(0);
  const [recent, setRecent] = useState([]);
  const [open, setOpen] = useState(null); // null = not loaded yet
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled) return undefined;

    const unsubCount = onSnapshot(
      collection(db, "attendance"),
      (snap) => setCount(snap.size),
      (e) => setError(e.message)
    );

    const unsubRecent = onSnapshot(
      query(collection(db, "attendance"), orderBy("createdAt", "desc"), limit(6)),
      (snap) =>
        setRecent(
          snap.docs.map((d) => ({
            id: d.id,
            at: d.data().createdAt?.toDate?.() ?? null,
          }))
        ),
      (e) => setError(e.message)
    );

    const unsubSession = onSnapshot(
      doc(db, "config", "session"),
      (snap) => setOpen(snap.exists() ? snap.data().open === true : false),
      (e) => setError(e.message)
    );

    return () => { unsubCount(); unsubRecent(); unsubSession(); };
  }, [enabled]);

  const setSessionOpen = useCallback(async (value) => {
    await setDoc(doc(db, "config", "session"), { open: value, updatedAt: serverTimestamp() });
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

    // Record reset timestamp so student phones clear their previous 'already counted' cache
    await setDoc(
      doc(db, "config", "session"),
      { resetAt: serverTimestamp(), updatedAt: serverTimestamp() },
      { merge: true }
    );
  }, []);

  return { count, recent, open, error, setSessionOpen, resetCount };
}
