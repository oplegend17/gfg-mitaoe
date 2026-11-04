import { useEffect, useState, useCallback } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../config/firebase.js";
import { SUB_TEAM_LEADS as STATIC_LEADS, SUB_TEAM_MEMBERS as STATIC_MEMBERS } from "../data/subTeamData.js";

export function useSubTeamData() {
  const [leads, setLeads] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [migrating, setMigrating] = useState(false);
  const [isFirebaseSynced, setIsFirebaseSynced] = useState(false);

  useEffect(() => {
    // 1. Real-time listener for sub_team_leads
    const unsubLeads = onSnapshot(
      query(collection(db, "sub_team_leads"), orderBy("order", "asc")),
      (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            isFirebase: true,
          }));
          setLeads(list);
          setIsFirebaseSynced(true);
        } else {
          // If Firestore is still empty, show static list
          setLeads(
            STATIC_LEADS.map((l, idx) => ({
              id: `static-lead-${idx}`,
              order: idx + 1,
              ...l,
              isFirebase: false,
            }))
          );
        }
      },
      (err) => {
        console.warn("Firestore sub_team_leads:", err.message);
        setError(err.message);
        setLeads(
          STATIC_LEADS.map((l, idx) => ({
            id: `static-lead-${idx}`,
            order: idx + 1,
            ...l,
            isFirebase: false,
          }))
        );
      }
    );

    // 2. Real-time listener for sub_team_members
    const unsubMembers = onSnapshot(
      query(collection(db, "sub_team_members"), orderBy("srNo", "asc")),
      (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            isFirebase: true,
          }));
          setMembers(list);
          setLoading(false);
          setIsFirebaseSynced(true);
        } else {
          // If Firestore is still empty, show static members
          setMembers(
            STATIC_MEMBERS.map((m) => ({
              id: `static-member-${m.srNo}`,
              ...m,
              isFirebase: false,
            }))
          );
          setLoading(false);
        }
      },
      (err) => {
        console.warn("Firestore sub_team_members:", err.message);
        setError(err.message);
        setMembers(
          STATIC_MEMBERS.map((m) => ({
            id: `static-member-${m.srNo}`,
            ...m,
            isFirebase: false,
          }))
        );
        setLoading(false);
      }
    );

    return () => {
      unsubLeads();
      unsubMembers();
    };
  }, []);

  // One-click migration: uploads all base records to Firestore so every single item can be edited/deleted
  const migrateAllToFirebase = useCallback(async () => {
    setMigrating(true);
    try {
      // Migrate Leads if not populated
      const leadsSnap = await getDocs(collection(db, "sub_team_leads"));
      if (leadsSnap.empty) {
        let batch = writeBatch(db);
        STATIC_LEADS.forEach((l, idx) => {
          const ref = doc(collection(db, "sub_team_leads"));
          batch.set(ref, {
            order: idx + 1,
            name: l.name,
            domain: l.domain,
            role: l.role || "Lead",
            year: l.year || "Second Year",
            branch: l.branch || "",
            status: l.status || "confirmed",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });
        await batch.commit();
      }

      // Migrate Members in batches of 400
      const membersSnap = await getDocs(collection(db, "sub_team_members"));
      if (membersSnap.empty) {
        let batch = writeBatch(db);
        let count = 0;
        for (let i = 0; i < STATIC_MEMBERS.length; i++) {
          const m = STATIC_MEMBERS[i];
          const ref = doc(collection(db, "sub_team_members"));
          batch.set(ref, {
            srNo: m.srNo || i + 1,
            name: m.name,
            year: m.year || "Second Year",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          count++;
          if (count === 400) {
            await batch.commit();
            batch = writeBatch(db);
            count = 0;
          }
        }
        if (count > 0) {
          await batch.commit();
        }
      }
      setIsFirebaseSynced(true);
    } finally {
      setMigrating(false);
    }
  }, []);

  // Add new Sub Team Lead
  const addLead = useCallback(async ({ domain, role, name, year, branch, status }) => {
    if (!name?.trim()) throw new Error("Lead name is required");
    const nextOrder = leads.length + 1;
    await addDoc(collection(db, "sub_team_leads"), {
      order: nextOrder,
      domain: domain?.trim() || "Technical Track",
      role: role?.trim() || "Lead",
      name: name.trim(),
      year: year?.trim() || "Second Year",
      branch: branch?.trim() || "",
      status: status?.trim() || "confirmed",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }, [leads.length]);

  // Update existing Sub Team Lead
  const updateLead = useCallback(async (id, data) => {
    if (!id) throw new Error("Lead ID is required");
    await updateDoc(doc(db, "sub_team_leads", id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }, []);

  // Delete Sub Team Lead
  const removeLead = useCallback(async (id) => {
    await deleteDoc(doc(db, "sub_team_leads", id));
  }, []);

  // Add new Sub Team Member
  const addMember = useCallback(async ({ name, year }) => {
    if (!name?.trim()) throw new Error("Member name is required");
    const nextSrNo = members.length + 1;
    await addDoc(collection(db, "sub_team_members"), {
      srNo: nextSrNo,
      name: name.trim(),
      year: year?.trim() || "Second Year",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }, [members.length]);

  // Update existing Sub Team Member
  const updateMember = useCallback(async (id, data) => {
    if (!id) throw new Error("Member ID is required");
    await updateDoc(doc(db, "sub_team_members", id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }, []);

  // Delete Sub Team Member
  const removeMember = useCallback(async (id) => {
    await deleteDoc(doc(db, "sub_team_members", id));
  }, []);

  return {
    leads,
    members,
    loading,
    error,
    migrating,
    isFirebaseSynced,
    migrateAllToFirebase,
    addLead,
    updateLead,
    removeLead,
    addMember,
    updateMember,
    removeMember,
  };
}
