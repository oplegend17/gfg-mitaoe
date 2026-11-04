import { useEffect, useState, useCallback, useMemo } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase.js";
import { SUB_TEAM_LEADS as STATIC_LEADS, SUB_TEAM_MEMBERS as STATIC_MEMBERS } from "../data/subTeamData.js";

export function useSubTeamData() {
  const [firebaseLeads, setFirebaseLeads] = useState([]);
  const [firebaseMembers, setFirebaseMembers] = useState([]);
  const [deletedIds, setDeletedIds] = useState(() => {
    try {
      const stored = localStorage.getItem("gfg_subteam_deleted_ids");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 1. Listen to Sub Team Leads in Firestore
    const unsubLeads = onSnapshot(
      query(collection(db, "sub_team_leads"), orderBy("createdAt", "asc")),
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          isFirestore: true,
        }));
        setFirebaseLeads(list);
      },
      (err) => {
        console.warn("Firestore sub_team_leads error:", err.message);
        setError(err.message);
      }
    );

    // 2. Listen to Sub Team Members in Firestore
    const unsubMembers = onSnapshot(
      query(collection(db, "sub_team_members"), orderBy("createdAt", "asc")),
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          isFirestore: true,
        }));
        setFirebaseMembers(list);
        setLoading(false);
      },
      (err) => {
        console.warn("Firestore sub_team_members error:", err.message);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      unsubLeads();
      unsubMembers();
    };
  }, []);

  // Sync deleted IDs to localStorage so deleted base records stay deleted
  const markAsDeleted = useCallback((id) => {
    setDeletedIds((prev) => {
      const next = Array.from(new Set([...prev, id]));
      try {
        localStorage.setItem("gfg_subteam_deleted_ids", JSON.stringify(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });
  }, []);

  // COMBINE LEADS: Base Excel Leads (10) + Any newly added Leads in Firestore
  const leads = useMemo(() => {
    const list = [];
    const seenNames = new Set();

    // 1. Add base static leads (if not deleted or overridden)
    STATIC_LEADS.forEach((l, idx) => {
      const baseId = `base-lead-${idx}`;
      if (!deletedIds.includes(baseId)) {
        list.push({
          id: baseId,
          order: idx + 1,
          ...l,
          isBase: true,
        });
        seenNames.add(l.name.toLowerCase().trim());
      }
    });

    // 2. Add Firestore leads
    firebaseLeads.forEach((fl, idx) => {
      if (!deletedIds.includes(fl.id)) {
        list.push({
          id: fl.id,
          order: list.length + 1,
          name: fl.name,
          domain: fl.domain || "Technical Track",
          role: fl.role || "Lead",
          year: fl.year || "Second Year",
          branch: fl.branch || "",
          status: fl.status || "confirmed",
          isBase: false,
        });
      }
    });

    return list;
  }, [firebaseLeads, deletedIds]);

  // COMBINE MEMBERS: All 74 Base Excel Members ALWAYS PRESERVED + Any newly added members in Firestore
  const members = useMemo(() => {
    const list = [];

    // 1. Base static members (all 74 from Sub Team.xlsx)
    STATIC_MEMBERS.forEach((m) => {
      const baseId = `base-member-${m.srNo}`;
      if (!deletedIds.includes(baseId)) {
        list.push({
          id: baseId,
          srNo: list.length + 1,
          name: m.name,
          year: m.year,
          isBase: true,
        });
      }
    });

    // 2. Newly added members in Firestore
    firebaseMembers.forEach((fm) => {
      if (!deletedIds.includes(fm.id)) {
        list.push({
          id: fm.id,
          srNo: list.length + 1,
          name: fm.name,
          year: fm.year || "Second Year",
          isBase: false,
        });
      }
    });

    return list;
  }, [firebaseMembers, deletedIds]);

  // Add new Sub Team Lead
  const addLead = useCallback(async ({ domain, role, name, year, branch, status }) => {
    if (!name?.trim()) throw new Error("Lead name is required");
    await addDoc(collection(db, "sub_team_leads"), {
      domain: domain?.trim() || "Technical Track",
      role: role?.trim() || "Lead",
      name: name.trim(),
      year: year?.trim() || "Second Year",
      branch: branch?.trim() || "",
      status: status?.trim() || "confirmed",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }, []);

  // Update Sub Team Lead
  const updateLead = useCallback(async (id, data) => {
    if (!id) throw new Error("Lead ID is required");
    if (id.startsWith("base-lead-")) {
      // Save override directly to Firestore
      await addDoc(collection(db, "sub_team_leads"), {
        domain: data.domain,
        role: data.role,
        name: data.name,
        year: data.year,
        branch: data.branch,
        status: data.status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      markAsDeleted(id);
      return;
    }
    await updateDoc(doc(db, "sub_team_leads", id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }, [markAsDeleted]);

  // Delete Sub Team Lead
  const removeLead = useCallback(async (id) => {
    if (id.startsWith("base-lead-")) {
      markAsDeleted(id);
      return;
    }
    await deleteDoc(doc(db, "sub_team_leads", id));
  }, [markAsDeleted]);

  // Add new Sub Team Member
  const addMember = useCallback(async ({ name, year }) => {
    if (!name?.trim()) throw new Error("Member name is required");
    await addDoc(collection(db, "sub_team_members"), {
      name: name.trim(),
      year: year?.trim() || "Second Year",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }, []);

  // Update Sub Team Member
  const updateMember = useCallback(async (id, data) => {
    if (!id) throw new Error("Member ID is required");
    if (id.startsWith("base-member-")) {
      await addDoc(collection(db, "sub_team_members"), {
        name: data.name,
        year: data.year,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      markAsDeleted(id);
      return;
    }
    await updateDoc(doc(db, "sub_team_members", id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }, [markAsDeleted]);

  // Delete Sub Team Member
  const removeMember = useCallback(async (id) => {
    if (id.startsWith("base-member-")) {
      markAsDeleted(id);
      return;
    }
    await deleteDoc(doc(db, "sub_team_members", id));
  }, [markAsDeleted]);

  return {
    leads,
    members,
    loading,
    error,
    addLead,
    updateLead,
    removeLead,
    addMember,
    updateMember,
    removeMember,
  };
}
