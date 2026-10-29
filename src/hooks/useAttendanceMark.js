import { useCallback, useEffect, useRef, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase.js";
import {
  getDeviceId,
  wasMarkedBefore,
  rememberMarked,
  getSavedStudentInfo,
  clearMarked,
} from "../utils/deviceId.js";

/**
 * Student attendance flow hook:
 * status: 'checking' | 'ready' | 'submitting' | 'success' | 'already' | 'closed' | 'error'
 */
export function useAttendanceMark() {
  const [status, setStatus] = useState("checking");
  const [errorMessage, setErrorMessage] = useState("");
  const [submittedInfo, setSubmittedInfo] = useState(null);
  const initialized = useRef(false);

  const checkStatus = useCallback(async () => {
    setStatus("checking");
    setErrorMessage("");

    try {
      const sessionSnap = await getDoc(doc(db, "config", "session"));
      if (!sessionSnap.exists() || sessionSnap.data().open !== true) {
        setStatus("closed");
        return;
      }

      const sessionData = sessionSnap.data();
      const currentResetAt = String(sessionData.resetAt?.toMillis?.() ?? 0);
      const storedResetAt = localStorage.getItem("gfg_reset_at") || "0";

      // If the admin reset the attendance since this phone last checked in, allow re-registering
      if (currentResetAt !== "0" && currentResetAt !== storedResetAt) {
        clearMarked();
        localStorage.setItem("gfg_reset_at", currentResetAt);
      }

      if (wasMarkedBefore()) {
        const saved = getSavedStudentInfo();
        setSubmittedInfo(saved);
        setStatus("already");
        return;
      }

      setStatus("ready");
    } catch (err) {
      console.error(err);
      setErrorMessage("Could not connect to the attendance session. Please check your internet connection.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    checkStatus();
  }, [checkStatus]);

  const submitAttendance = useCallback(async (formData) => {
    setStatus("submitting");
    setErrorMessage("");

    try {
      const sessionSnap = await getDoc(doc(db, "config", "session"));
      if (!sessionSnap.exists() || sessionSnap.data().open !== true) {
        setStatus("closed");
        return;
      }

      const sessionData = sessionSnap.data();
      const currentResetAt = String(sessionData.resetAt?.toMillis?.() ?? 0);

      const deviceId = getDeviceId();
      const dataToSave = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        branch: formData.branch.trim(),
        year: formData.year,
        feedback: formData.feedback ? formData.feedback.trim() : "",
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, "attendance", deviceId), dataToSave);

      const savedInfo = {
        name: dataToSave.name,
        email: dataToSave.email,
        branch: dataToSave.branch,
        year: dataToSave.year,
        feedback: dataToSave.feedback,
      };

      rememberMarked(savedInfo);
      localStorage.setItem("gfg_reset_at", currentResetAt);

      setSubmittedInfo(savedInfo);
      setStatus("success");
    } catch (err) {
      if (err?.code === "permission-denied") {
        rememberMarked();
        setStatus("already");
        return;
      }
      console.error(err);
      setErrorMessage(err.message || "Failed to record attendance. Please check your connection and try again.");
      setStatus("error");
    }
  }, []);

  return {
    status,
    errorMessage,
    submittedInfo,
    submitAttendance,
    retry: checkStatus,
  };
}
