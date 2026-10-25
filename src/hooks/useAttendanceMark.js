import { useCallback, useEffect, useRef, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase.js";
import { getDeviceId, wasMarkedBefore, rememberMarked } from "../utils/deviceId.js";

/**
 * Student flow. Runs once on page load:
 * loading -> success | already | closed | error
 */
export function useAttendanceMark() {
  const [status, setStatus] = useState("loading");
  const started = useRef(false);

  const mark = useCallback(async () => {
    setStatus("loading");

    try {
      const sessionSnap = await getDoc(doc(db, "config", "session"));
      if (!sessionSnap.exists() || sessionSnap.data().open !== true) {
        setStatus("closed");
        return;
      }

      const sessionData = sessionSnap.data();
      const currentResetAt = String(sessionData.resetAt?.toMillis?.() ?? 0);
      const storedResetAt = localStorage.getItem("gfg_reset_at") || "0";

      // If the admin reset the attendance since this phone last checked in, allow re-marking!
      if (currentResetAt !== "0" && currentResetAt !== storedResetAt) {
        localStorage.removeItem("gfg_orientation_marked");
        localStorage.setItem("gfg_reset_at", currentResetAt);
      }

      if (wasMarkedBefore()) {
        setStatus("already");
        return;
      }

      const deviceId = getDeviceId();
      await setDoc(doc(db, "attendance", deviceId), { createdAt: serverTimestamp() });
      rememberMarked();
      localStorage.setItem("gfg_reset_at", currentResetAt);
      setStatus("success");
    } catch (err) {
      if (err?.code === "permission-denied") {
        // Session is open (checked above), so the rule failed because this
        // device already has a record. Count it as already marked.
        rememberMarked();
        setStatus("already");
        return;
      }
      console.error(err);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    mark();
  }, [mark]);

  return { status, retry: mark };
}
