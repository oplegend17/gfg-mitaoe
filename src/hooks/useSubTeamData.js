import { useEffect, useState, useCallback } from "react";
import {
  collection,
  addDoc,
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
  const [customLeads, setCustomLeads] = useState([]);
  const [customMembers, setCustomMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Listen to custom sub-team leads
    const unsubLeads = onSnapshot(
      query(collection(db, "sub_team_leads"), orderBy("createdAt", "desc")),
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          isCustom: true,
        }));
        setCustomLeads(list);
      },
      (err) => {
        console.warn("Firestore sub_team_leads listener:", err.message);
        setError(err.message);
      }
    );

    // Listen to custom sub-team members
    const unsubMembers = onSnapshot(
      query(collection(db, "sub_team_members"), orderBy("createdAt", "desc")),
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          isCustom: true,
        }));
        setCustomMembers(list);
        setLoading(false);
      },
      (err) => {
        console.warn("Firestore sub_team_members listener:", err.message);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      unsubLeads();
      unsubMembers();
    };
  }, []);

  // Combined Leads: Custom added leads first, followed by static leads
  const allLeads = [
    ...customLeads.map((l) => ({
      id: l.id,
      domain: l.domain || "Technical",
      role: l.role || "Lead",
      name: l.name,
      year: l.year || "Second Year",
      branch: l.branch || "",
      status: l.status || "confirmed",
      isCustom: true,
    })),
    ...STATIC_LEADS.map((l, idx) => ({
      id: `static-lead-${idx}`,
      ...l,
      isCustom: false,
    })),
  ];

  // Combined Members: Custom added members first, followed by static members
  const allMembers = [
    ...customMembers.map((m, idx) => ({
      id: m.id,
      srNo: idx + 1,
      name: m.name,
      year: m.year || "Second Year",
      isCustom: true,
    })),
    ...STATIC_MEMBERS.map((m) => ({
      id: `static-member-${m.srNo}`,
      ...m,
      srNo: m.srNo + customMembers.length,
      isCustom: false,
    })),
  ];

  // Add new Sub Team Lead to Firestore
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
    });
  }, []);

  // Delete Sub Team Lead
  const removeLead = useCallback(async (id) => {
    await deleteDoc(doc(db, "sub_team_leads", id));
  }, []);

  // Add new Sub Team Member to Firestore
  const addMember = useCallback(async ({ name, year }) => {
    if (!name?.trim()) throw new Error("Member name is required");
    await addDoc(collection(db, "sub_team_members"), {
      name: name.trim(),
      year: year?.trim() || "Second Year",
      createdAt: serverTimestamp(),
    });
  }, []);

  // Delete Sub Team Member
  const removeMember = useCallback(async (id) => {
    await deleteDoc(doc(db, "sub_team_members", id));
  }, []);

  return {
    leads: allLeads,
    members: allMembers,
    customLeads,
    customMembers,
    loading,
    error,
    addLead,
    removeLead,
    addMember,
    removeMember,
  };
}

