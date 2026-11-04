import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../hooks/useAuth.js";
import { useAttendanceAdmin } from "../hooks/useAttendanceAdmin.js";
import { useSubTeamData } from "../hooks/useSubTeamData.js";
import { EVENT, PUBLIC_URL } from "../config/firebase.js";
import Brand from "../components/Brand.jsx";
import { CornerTriangles, DotGrid, Sparkle } from "../components/Decor.jsx";
import { exportAttendeesToExcel } from "../utils/exportExcel.js";

const btnBase =
  "rounded-2xl border-[3px] border-ink px-5 py-2.5 text-sm font-bold shadow-pop-ink transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50 cursor-pointer select-none relative z-10";

function Shell({ children }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-paper">
      <CornerTriangles className="pointer-events-none absolute -left-2 -top-2 h-32 w-32" />
      <CornerTriangles className="pointer-events-none absolute -bottom-2 -right-2 h-32 w-32" flip />
      <div className="relative">{children}</div>
    </main>
  );
}

function Login({ onLogin, error }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    await onLogin(email, password);
    setBusy(false);
  };

  return (
    <Shell>
      <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5">
        <div className="mb-8 flex justify-center">
          <Brand size="lg" />
        </div>
        <form
          onSubmit={submit}
          className="rounded-3xl border-[3px] border-gfg-deep bg-white p-7 shadow-pop"
        >
          <h1 className="text-2xl font-extrabold text-gfg">Admin sign in</h1>

          <label htmlFor="email" className="mt-6 block text-sm font-semibold">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border-2 border-ink/30 bg-paper px-4 py-3 text-base font-medium focus:border-gfg focus:outline-none"
          />

          <label htmlFor="password" className="mt-4 block text-sm font-semibold">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border-2 border-ink/30 bg-paper px-4 py-3 text-base font-medium focus:border-gfg focus:outline-none"
          />

          {error && <p role="alert" className="mt-4 text-sm font-semibold text-alert">{error}</p>}

          <button type="submit" disabled={busy} className={`${btnBase} mt-6 w-full bg-gfg text-white`}>
            {busy ? "Signing in" : "Sign in"}
          </button>
        </form>
      </div>
    </Shell>
  );
}

function Denied({ email, onLogout }) {
  return (
    <Shell>
      <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5 text-center">
        <div className="rounded-3xl border-[3px] border-ink bg-white p-7 shadow-pop-ink">
          <h1 className="text-2xl font-extrabold">Access denied</h1>
          <p className="mt-3 text-sm font-medium text-ink/70">
            {email} is not the admin account for this event.
          </p>
          <button onClick={onLogout} className={`${btnBase} mt-6 bg-sun`}>Sign out</button>
        </div>
      </div>
    </Shell>
  );
}

function Dashboard({ user, onLogout }) {
  const {
    count,
    attendees,
    open,
    resultsPublished,
    error,
    setSessionOpen,
    setResultsPublished,
    resetCount,
  } = useAttendanceAdmin(true);

  const {
    leads,
    members,
    migrating,
    isFirebaseSynced,
    migrateAllToFirebase,
    addLead,
    updateLead,
    removeLead,
    addMember,
    updateMember,
    removeMember,
  } = useSubTeamData();

  const [busy, setBusy] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");
  const [activeFeedbackModal, setActiveFeedbackModal] = useState(null);

  // Sub Team Tabs & Forms
  const [subTeamTab, setSubTeamTab] = useState("leads"); // 'leads' | 'members'
  const [leadForm, setLeadForm] = useState({
    name: "",
    domain: "",
    role: "Lead",
    year: "Second Year",
    branch: "",
    status: "confirmed",
  });
  const [memberForm, setMemberForm] = useState({
    name: "",
    year: "Second Year",
  });
  const [subTeamSuccess, setSubTeamSuccess] = useState("");
  const [subTeamError, setSubTeamError] = useState("");

  // Edit Modals
  const [editingLead, setEditingLead] = useState(null);
  const [editingMember, setEditingMember] = useState(null);

  const joinUrl = PUBLIC_URL || (typeof window !== "undefined" ? window.location.origin : "");

  const run = async (fn) => {
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      console.error(err);
      alert(err.message || "Action failed");
    } finally {
      setBusy(false);
    }
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  };

  const [confirmReset, setConfirmReset] = useState(false);

  const onReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 4000);
      return;
    }
    setConfirmReset(false);
    run(resetCount);
  };

  // Add Lead
  const handleAddLead = async (e) => {
    e.preventDefault();
    setSubTeamError("");
    setSubTeamSuccess("");
    if (!leadForm.name.trim() || !leadForm.domain.trim()) {
      setSubTeamError("Lead Name and Sub Team Domain are required.");
      return;
    }
    try {
      await addLead(leadForm);
      setSubTeamSuccess(`Saved Lead "${leadForm.name}" successfully!`);
      setLeadForm({
        name: "",
        domain: "",
        role: "Lead",
        year: "Second Year",
        branch: "",
        status: "confirmed",
      });
      setTimeout(() => setSubTeamSuccess(""), 4000);
    } catch (err) {
      setSubTeamError(err.message || "Failed to add lead");
    }
  };

  // Save edited Lead
  const handleSaveEditedLead = async (e) => {
    e.preventDefault();
    if (!editingLead) return;
    try {
      await updateLead(editingLead.id, {
        name: editingLead.name,
        domain: editingLead.domain,
        role: editingLead.role,
        year: editingLead.year,
        branch: editingLead.branch,
        status: editingLead.status,
      });
      setSubTeamSuccess(`Updated "${editingLead.name}" successfully!`);
      setEditingLead(null);
      setTimeout(() => setSubTeamSuccess(""), 4000);
    } catch (err) {
      setSubTeamError(err.message || "Failed to update lead");
    }
  };

  // Add Member
  const handleAddMember = async (e) => {
    e.preventDefault();
    setSubTeamError("");
    setSubTeamSuccess("");
    if (!memberForm.name.trim()) {
      setSubTeamError("Member Name is required.");
      return;
    }
    try {
      await addMember(memberForm);
      setSubTeamSuccess(`Saved Member "${memberForm.name}" successfully!`);
      setMemberForm({
        name: "",
        year: "Second Year",
      });
      setTimeout(() => setSubTeamSuccess(""), 4000);
    } catch (err) {
      setSubTeamError(err.message || "Failed to add member");
    }
  };

  // Save edited Member
  const handleSaveEditedMember = async (e) => {
    e.preventDefault();
    if (!editingMember) return;
    try {
      await updateMember(editingMember.id, {
        name: editingMember.name,
        year: editingMember.year,
      });
      setSubTeamSuccess(`Updated "${editingMember.name}" successfully!`);
      setEditingMember(null);
      setTimeout(() => setSubTeamSuccess(""), 4000);
    } catch (err) {
      setSubTeamError(err.message || "Failed to update member");
    }
  };

  // Unique list of branches for filter dropdown
  const branchOptions = useMemo(() => {
    const set = new Set();
    attendees.forEach((a) => {
      if (a.branch && a.branch !== "—") set.add(a.branch);
    });
    return Array.from(set);
  }, [attendees]);

  // Filtered attendees based on search and filters
  const filteredAttendees = useMemo(() => {
    return attendees.filter((a) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.branch.toLowerCase().includes(q);

      const matchesBranch = branchFilter === "ALL" || a.branch === branchFilter;
      const matchesYear = yearFilter === "ALL" || a.year === yearFilter;

      return matchesSearch && matchesBranch && matchesYear;
    });
  }, [attendees, searchQuery, branchFilter, yearFilter]);

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Top Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Brand />
          <div className="flex items-center gap-3">
            <span
              className={`flex items-center gap-2 rounded-full border-[3px] border-ink px-4 py-1.5 text-sm font-bold ${
                open ? "bg-gfg text-white" : "bg-sun text-ink"
              }`}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${open ? "animate-pulse bg-white" : "bg-ink"}`} />
              {open === null ? "Loading" : open ? "Attendance open" : "Attendance closed"}
            </span>
          </div>
        </header>

        <div className="mt-4 h-px w-full bg-gfg/40" />

        {/* Live Status & Projector Section */}
        <div className="mt-8 grid items-center gap-10 lg:grid-cols-[minmax(0,24rem)_1fr]">
          {/* QR Code Card */}
          <section className="relative mx-auto w-full max-w-[24rem]">
            <div className="absolute -top-4 left-6 z-10 flex items-center gap-2 rounded-t-xl border-[3px] border-b-0 border-gfg-deep bg-gfg px-5 py-1 text-sm font-extrabold uppercase text-white">
              <Sparkle className="h-4 w-4" />
              Scan to Register
            </div>
            <div className="rounded-3xl border-[3px] border-gfg-deep bg-white p-6 shadow-pop">
              <QRCodeSVG value={joinUrl} size={512} level="M" marginSize={0} className="h-auto w-full" />
            </div>
            <p className="mt-4 text-center text-xs font-semibold text-ink/60">
              {EVENT.date} · {EVENT.time} · Venue {EVENT.venue}
            </p>
          </section>

          {/* Live Count & Controls */}
          <section>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">
              <span className="block text-ink">Students Checked In</span>
              <span className="block text-gfg">Flo101 Session</span>
            </h1>

            <div className="pointer-events-none mt-3 flex select-none items-baseline gap-4">
              <span
                key={count}
                aria-live="polite"
                className="animate-tick text-[clamp(4.5rem,10vw,8rem)] font-extrabold leading-none tabular-nums text-gfg"
              >
                {count}
              </span>
              <span className="text-lg font-bold uppercase tracking-wider text-ink/50 sm:text-xl">
                total records
              </span>
            </div>

            {error && (
              <p role="alert" className="mt-4 rounded-xl border-2 border-alert bg-white px-4 py-2 text-sm font-semibold text-alert">
                {error}
              </p>
            )}

            {/* Admin Action Buttons */}
            <div className="relative z-20 mt-6 flex flex-wrap items-center gap-3">
              <button
                disabled={busy || open === null}
                onClick={() => run(() => setSessionOpen(!open))}
                className={`${btnBase} ${open ? "bg-sun text-ink" : "bg-gfg text-white"}`}
              >
                {open ? "Stop attendance" : "Start attendance"}
              </button>

              <Link
                to="/qr"
                target="_blank"
                className={`${btnBase} bg-white text-ink inline-flex items-center gap-1.5`}
              >
                <span>Projector QR (/qr) ↗</span>
              </Link>

              <Link
                to="/results"
                target="_blank"
                className={`${btnBase} ${
                  resultsPublished ? "bg-gfg text-white" : "bg-sun text-ink"
                } inline-flex items-center gap-1.5`}
              >
                <span>{resultsPublished ? "View Results (/results) ↗" : "Prank Mode (/results) ↗"}</span>
              </Link>

              <button
                onClick={() => exportAttendeesToExcel(attendees)}
                disabled={attendees.length === 0}
                className={`${btnBase} bg-gfg-tint text-gfg-deep border-gfg-deep hover:bg-gfg hover:text-white transition-colors inline-flex items-center gap-2`}
                title="Download attendee roster as Microsoft Excel .xlsx"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Export Excel (.xlsx)</span>
              </button>

              <button onClick={toggleFullscreen} className={`${btnBase} bg-white text-ink`}>
                Full screen
              </button>

              <button
                disabled={busy}
                onClick={onReset}
                className={`${btnBase} transition-colors ${
                  confirmReset
                    ? "bg-alert text-white animate-pulse border-alert"
                    : "bg-white text-alert"
                }`}
              >
                {confirmReset ? "Click to confirm clear all" : "Clear all records"}
              </button>

              <button onClick={onLogout} className={`${btnBase} bg-white text-ink`}>
                Sign out
              </button>
            </div>
          </section>
        </div>

        {/* Recruitment Results & Prank Mode Control Card */}
        <section className="mt-10 rounded-3xl border-[3px] border-ink bg-white p-6 shadow-pop-ink">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-2xl">🎭</span>
                <h2 className="text-xl font-extrabold text-ink sm:text-2xl">
                  Recruitment Verdict & Prank Controller (/results)
                </h2>
                <span
                  className={`rounded-full border-2 border-ink px-3 py-0.5 text-xs font-extrabold uppercase ${
                    resultsPublished
                      ? "bg-gfg text-white"
                      : "bg-alert text-white animate-pulse"
                  }`}
                >
                  {resultsPublished ? "✓ Results Live for All Students" : "⚡ Prank Glitch Mode Active"}
                </span>
              </div>
              <p className="mt-2 text-xs sm:text-sm font-semibold text-ink/75 max-w-2xl">
                {resultsPublished
                  ? "The official recruitment verdict (Tech Team & Management Team) is revealed and accessible to students on /results."
                  : "Prank Mode is ON: When students open /results, they see an authentic glitchy terminal, broken decryption screen, and fake server crash!"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/results"
                target="_blank"
                className={`${btnBase} bg-paper text-ink inline-flex items-center gap-1.5`}
              >
                <span>Open /results ↗</span>
              </Link>

              <button
                disabled={busy}
                onClick={() => run(() => setResultsPublished(!resultsPublished))}
                className={`${btnBase} ${
                  resultsPublished
                    ? "bg-alert text-white"
                    : "bg-gfg text-white"
                }`}
              >
                {resultsPublished ? "Lock & Activate Prank Mode" : "Release Official Results 🚀"}
              </button>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SUB TEAM MANAGEMENT SECTION (ADD & EDIT LEADS & MEMBERS) */}
        {/* ============================================================ */}
        <section className="mt-10 rounded-3xl border-[3px] border-gfg-deep bg-white p-6 sm:p-8 shadow-pop">
          {/* Header */}
          <div className="flex flex-col gap-4 border-b-2 border-gfg/30 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚡</span>
                <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">
                  Sub Team Records Manager
                </h2>
                <span className="rounded-full border-2 border-gfg bg-gfg-tint px-3 py-0.5 text-xs font-extrabold text-gfg-deep">
                  {leads.length} Leads · {members.length} Members
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold text-ink/65">
                Add, edit, and manage all Sub Team Leads (on /results) and Sub Team Members (on /subteam).
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to="/results"
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-2xl border-2 border-ink bg-paper px-4 py-2 text-xs font-extrabold uppercase text-ink shadow-pop-sm hover:bg-white"
              >
                Preview Leads ↗
              </Link>
              <Link
                to="/subteam"
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-2xl border-2 border-ink bg-gfg px-4 py-2 text-xs font-extrabold uppercase text-white shadow-pop-sm hover:bg-gfg-deep"
              >
                Preview Members ↗
              </Link>
            </div>
          </div>

          {/* Subteam Tabs: Leads vs Members */}
          <div className="mt-6 flex flex-wrap gap-2.5">
            <button
              onClick={() => {
                setSubTeamTab("leads");
                setSubTeamError("");
                setSubTeamSuccess("");
              }}
              className={`rounded-2xl border-[2.5px] px-5 py-2.5 text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                subTeamTab === "leads"
                  ? "border-ink bg-ink text-white shadow-pop-ink"
                  : "border-ink/30 bg-paper text-ink hover:border-ink shadow-pop-sm"
              }`}
            >
              👑 Sub Team Leads ({leads.length})
            </button>
            <button
              onClick={() => {
                setSubTeamTab("members");
                setSubTeamError("");
                setSubTeamSuccess("");
              }}
              className={`rounded-2xl border-[2.5px] px-5 py-2.5 text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                subTeamTab === "members"
                  ? "border-ink bg-gfg text-white shadow-pop-ink"
                  : "border-ink/30 bg-paper text-ink hover:border-ink shadow-pop-sm"
              }`}
            >
              👥 Sub Team Members ({members.length})
            </button>
          </div>

          {/* Notifications */}
          {subTeamSuccess && (
            <div className="mt-4 rounded-2xl border-2 border-gfg bg-gfg-tint p-3 text-sm font-extrabold text-gfg-deep animate-pop">
              ✓ {subTeamSuccess}
            </div>
          )}
          {subTeamError && (
            <div className="mt-4 rounded-2xl border-2 border-alert bg-red-50 p-3 text-sm font-extrabold text-alert">
              ✕ {subTeamError}
            </div>
          )}

          {/* 1. SUB TEAM LEADS (FORM & EDITABLE LIST) */}
          {subTeamTab === "leads" && (
            <div className="mt-6 space-y-6">
              {/* Add Lead Form */}
              <div className="rounded-2xl border-2 border-ink/20 bg-paper p-5 sm:p-6 shadow-pop-sm">
                <div className="flex items-center gap-2 border-b border-ink/10 pb-3">
                  <span className="text-xl">➕</span>
                  <h3 className="text-lg font-extrabold text-ink">
                    Add New Sub Team Lead
                  </h3>
                </div>

                <form onSubmit={handleAddLead} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wide text-ink/70">
                      Lead Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Atharva Baodhankar"
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                      className="mt-1 w-full rounded-xl border-2 border-ink/30 bg-white px-3.5 py-2.5 text-sm font-semibold text-ink focus:border-gfg focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wide text-ink/70">
                      Sub Team Domain *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Web & Product, AI / ML, Cloud..."
                      value={leadForm.domain}
                      onChange={(e) => setLeadForm({ ...leadForm, domain: e.target.value })}
                      className="mt-1 w-full rounded-xl border-2 border-ink/30 bg-white px-3.5 py-2.5 text-sm font-semibold text-ink focus:border-gfg focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wide text-ink/70">
                      Role / Title
                    </label>
                    <input
                      type="text"
                      placeholder="Lead"
                      value={leadForm.role}
                      onChange={(e) => setLeadForm({ ...leadForm, role: e.target.value })}
                      className="mt-1 w-full rounded-xl border-2 border-ink/30 bg-white px-3.5 py-2.5 text-sm font-semibold text-ink focus:border-gfg focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wide text-ink/70">
                      Year
                    </label>
                    <select
                      value={leadForm.year}
                      onChange={(e) => setLeadForm({ ...leadForm, year: e.target.value })}
                      className="mt-1 w-full rounded-xl border-2 border-ink/30 bg-white px-3.5 py-2.5 text-sm font-semibold text-ink focus:border-gfg focus:outline-none cursor-pointer"
                    >
                      <option value="First Year">First Year (FY)</option>
                      <option value="Second Year">Second Year (SY)</option>
                      <option value="Third Year">Third Year (TY)</option>
                      <option value="Final Year">Final Year (B.Tech)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wide text-ink/70">
                      Branch (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Software Engineering, AI&ML..."
                      value={leadForm.branch}
                      onChange={(e) => setLeadForm({ ...leadForm, branch: e.target.value })}
                      className="mt-1 w-full rounded-xl border-2 border-ink/30 bg-white px-3.5 py-2.5 text-sm font-semibold text-ink focus:border-gfg focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wide text-ink/70">
                      Status
                    </label>
                    <select
                      value={leadForm.status}
                      onChange={(e) => setLeadForm({ ...leadForm, status: e.target.value })}
                      className="mt-1 w-full rounded-xl border-2 border-ink/30 bg-white px-3.5 py-2.5 text-sm font-semibold text-ink focus:border-gfg focus:outline-none cursor-pointer"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="Pending confirmation">Pending Confirmation</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
                    <button
                      type="submit"
                      className="rounded-2xl border-[3px] border-ink bg-gfg px-6 py-2.5 text-sm font-extrabold text-white shadow-pop-ink transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                    >
                      + Save Sub Team Lead
                    </button>
                  </div>
                </form>
              </div>

              {/* Editable Leads Table */}
              <div className="overflow-hidden rounded-2xl border-2 border-ink/20">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-ink/20 bg-gfg-tint text-xs font-extrabold uppercase tracking-wide text-ink">
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Domain</th>
                        <th className="px-4 py-3">Lead Name</th>
                        <th className="px-4 py-3">Year & Branch</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gfg/20 bg-white text-sm">
                      {leads.map((lead, idx) => (
                        <tr key={lead.id || idx} className="hover:bg-paper/60 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs font-bold text-ink/40">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-block rounded-lg border border-gfg/40 bg-gfg-tint px-2.5 py-0.5 text-xs font-extrabold text-gfg-deep uppercase">
                              {lead.domain}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-extrabold text-ink">{lead.name}</span>
                          </td>
                          <td className="px-4 py-3 text-xs font-semibold text-ink/75">
                            {lead.year}{lead.branch ? ` · ${lead.branch}` : ""}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-lg border px-2 py-0.5 font-mono text-[11px] font-extrabold uppercase ${
                                lead.status?.toLowerCase().includes("pending")
                                  ? "border-amber-400 bg-amber-50 text-amber-800"
                                  : "border-gfg/40 bg-gfg-tint text-gfg-deep"
                              }`}
                            >
                              {lead.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditingLead(lead)}
                                className="rounded-xl border border-ink/30 bg-paper px-2.5 py-1 text-xs font-bold text-ink hover:border-ink hover:bg-white transition-colors cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Remove lead "${lead.name}"?`)) {
                                    removeLead(lead.id);
                                  }
                                }}
                                className="rounded-xl border border-alert bg-red-50 px-2.5 py-1 text-xs font-bold text-alert hover:bg-alert hover:text-white transition-colors cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. SUB TEAM MEMBERS (FORM & EDITABLE LIST) */}
          {subTeamTab === "members" && (
            <div className="mt-6 space-y-6">
              {/* Add Member Form */}
              <div className="rounded-2xl border-2 border-ink/20 bg-paper p-5 sm:p-6 shadow-pop-sm">
                <div className="flex items-center gap-2 border-b border-ink/10 pb-3">
                  <span className="text-xl">➕</span>
                  <h3 className="text-lg font-extrabold text-ink">
                    Add New Sub Team Member
                  </h3>
                </div>

                <form onSubmit={handleAddMember} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-extrabold uppercase tracking-wide text-ink/70">
                      Member Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Shiv Sasane"
                      value={memberForm.name}
                      onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                      className="mt-1 w-full rounded-xl border-2 border-ink/30 bg-white px-3.5 py-2.5 text-sm font-semibold text-ink focus:border-gfg focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wide text-ink/70">
                      Year *
                    </label>
                    <select
                      value={memberForm.year}
                      onChange={(e) => setMemberForm({ ...memberForm, year: e.target.value })}
                      className="mt-1 w-full rounded-xl border-2 border-ink/30 bg-white px-3.5 py-2.5 text-sm font-semibold text-ink focus:border-gfg focus:outline-none cursor-pointer"
                    >
                      <option value="First Year">First Year (FY)</option>
                      <option value="Second Year">Second Year (SY)</option>
                      <option value="Third Year">Third Year (TY)</option>
                      <option value="Final Year">Final Year (B.Tech)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
                    <button
                      type="submit"
                      className="rounded-2xl border-[3px] border-ink bg-gfg px-6 py-2.5 text-sm font-extrabold text-white shadow-pop-ink transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                    >
                      + Save Sub Team Member
                    </button>
                  </div>
                </form>
              </div>

              {/* Editable Members Table */}
              <div className="overflow-hidden rounded-2xl border-2 border-ink/20">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-ink/20 bg-gfg-tint text-xs font-extrabold uppercase tracking-wide text-ink">
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Member Name</th>
                        <th className="px-4 py-3">Year</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gfg/20 bg-white text-sm">
                      {members.map((member, idx) => (
                        <tr key={member.id || idx} className="hover:bg-paper/60 transition-colors">
                          <td className="px-4 py-2.5 font-mono text-xs font-bold text-ink/40">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="font-extrabold text-ink">{member.name}</span>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="inline-block rounded-lg border border-ink/20 bg-paper px-2 py-0.5 text-xs font-extrabold text-ink">
                              {member.year}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditingMember(member)}
                                className="rounded-xl border border-ink/30 bg-paper px-2.5 py-1 text-xs font-bold text-ink hover:border-ink hover:bg-white transition-colors cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Remove member "${member.name}"?`)) {
                                    removeMember(member.id);
                                  }
                                }}
                                className="rounded-xl border border-alert bg-red-50 px-2.5 py-1 text-xs font-bold text-alert hover:bg-alert hover:text-white transition-colors cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Modal: Edit Sub Team Lead */}
        {editingLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-lg rounded-3xl border-[3px] border-ink bg-white p-6 shadow-pop-ink animate-pop">
              <div className="flex items-center justify-between border-b border-gfg/30 pb-3">
                <h3 className="text-lg font-extrabold text-ink">
                  Edit Sub Team Lead
                </h3>
                <button
                  onClick={() => setEditingLead(null)}
                  className="rounded-full border-2 border-ink p-1 text-ink hover:bg-paper"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSaveEditedLead} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-ink/70">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingLead.name}
                    onChange={(e) => setEditingLead({ ...editingLead, name: e.target.value })}
                    className="mt-1 w-full rounded-xl border-2 border-ink/30 bg-paper px-3 py-2 text-sm font-semibold text-ink focus:border-gfg focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-ink/70">Domain</label>
                    <input
                      type="text"
                      required
                      value={editingLead.domain}
                      onChange={(e) => setEditingLead({ ...editingLead, domain: e.target.value })}
                      className="mt-1 w-full rounded-xl border-2 border-ink/30 bg-paper px-3 py-2 text-sm font-semibold text-ink focus:border-gfg focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-ink/70">Role</label>
                    <input
                      type="text"
                      value={editingLead.role}
                      onChange={(e) => setEditingLead({ ...editingLead, role: e.target.value })}
                      className="mt-1 w-full rounded-xl border-2 border-ink/30 bg-paper px-3 py-2 text-sm font-semibold text-ink focus:border-gfg focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-ink/70">Year</label>
                    <select
                      value={editingLead.year}
                      onChange={(e) => setEditingLead({ ...editingLead, year: e.target.value })}
                      className="mt-1 w-full rounded-xl border-2 border-ink/30 bg-paper px-3 py-2 text-sm font-semibold text-ink focus:border-gfg focus:bg-white"
                    >
                      <option value="First Year">First Year (FY)</option>
                      <option value="Second Year">Second Year (SY)</option>
                      <option value="Third Year">Third Year (TY)</option>
                      <option value="Final Year">Final Year (B.Tech)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-ink/70">Status</label>
                    <select
                      value={editingLead.status}
                      onChange={(e) => setEditingLead({ ...editingLead, status: e.target.value })}
                      className="mt-1 w-full rounded-xl border-2 border-ink/30 bg-paper px-3 py-2 text-sm font-semibold text-ink focus:border-gfg focus:bg-white"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="Pending confirmation">Pending Confirmation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-ink/70">Branch</label>
                  <input
                    type="text"
                    value={editingLead.branch || ""}
                    onChange={(e) => setEditingLead({ ...editingLead, branch: e.target.value })}
                    className="mt-1 w-full rounded-xl border-2 border-ink/30 bg-paper px-3 py-2 text-sm font-semibold text-ink focus:border-gfg focus:bg-white"
                  />
                </div>

                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingLead(null)}
                    className="flex-1 rounded-2xl border-2 border-ink/30 bg-white py-2.5 text-sm font-bold text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-2xl border-[3px] border-ink bg-gfg py-2.5 text-sm font-bold text-white shadow-pop-ink"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Sub Team Member */}
        {editingMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-3xl border-[3px] border-ink bg-white p-6 shadow-pop-ink animate-pop">
              <div className="flex items-center justify-between border-b border-gfg/30 pb-3">
                <h3 className="text-lg font-extrabold text-ink">
                  Edit Sub Team Member
                </h3>
                <button
                  onClick={() => setEditingMember(null)}
                  className="rounded-full border-2 border-ink p-1 text-ink hover:bg-paper"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSaveEditedMember} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-ink/70">Member Name</label>
                  <input
                    type="text"
                    required
                    value={editingMember.name}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                    className="mt-1 w-full rounded-xl border-2 border-ink/30 bg-paper px-3 py-2 text-sm font-semibold text-ink focus:border-gfg focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-ink/70">Year</label>
                  <select
                    value={editingMember.year}
                    onChange={(e) => setEditingMember({ ...editingMember, year: e.target.value })}
                    className="mt-1 w-full rounded-xl border-2 border-ink/30 bg-paper px-3 py-2 text-sm font-semibold text-ink focus:border-gfg focus:bg-white"
                  >
                    <option value="First Year">First Year (FY)</option>
                    <option value="Second Year">Second Year (SY)</option>
                    <option value="Third Year">Third Year (TY)</option>
                    <option value="Final Year">Final Year (B.Tech)</option>
                  </select>
                </div>

                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="flex-1 rounded-2xl border-2 border-ink/30 bg-white py-2.5 text-sm font-bold text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-2xl border-[3px] border-ink bg-gfg py-2.5 text-sm font-bold text-white shadow-pop-ink"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Attendee Roster Section */}
        <section className="mt-12 w-full rounded-3xl border-[3px] border-gfg-deep bg-white p-5 sm:p-8 shadow-pop">
          {/* Header & Controls */}
          <div className="flex flex-col gap-4 border-b border-gfg/30 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">
                  Attendee Roster
                </h2>
                <span className="rounded-full border-2 border-gfg bg-gfg-tint px-3 py-0.5 text-xs font-extrabold text-gfg-deep">
                  {filteredAttendees.length} of {count}
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold text-ink/60">
                Live list of students who submitted the attendance form.
              </p>
            </div>

            <button
              onClick={() => exportAttendeesToExcel(attendees)}
              disabled={attendees.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-[3px] border-ink bg-gfg px-5 py-2.5 text-sm font-extrabold text-white shadow-pop-ink transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export Roster (.xlsx)</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, or branch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border-2 border-ink/30 bg-paper py-2.5 pl-10 pr-4 text-sm font-semibold text-ink placeholder:text-ink/40 focus:border-gfg focus:bg-white focus:outline-none"
              />
              <svg
                className="absolute left-3.5 top-3 h-4 w-4 text-ink/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Branch Filter */}
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="rounded-2xl border-2 border-ink/30 bg-paper px-3 py-2.5 text-sm font-semibold text-ink focus:border-gfg focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Branches</option>
              {branchOptions.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            {/* Year Filter */}
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="rounded-2xl border-2 border-ink/30 bg-paper px-3 py-2.5 text-sm font-semibold text-ink focus:border-gfg focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Years</option>
              <option value="FY">First Year (FY)</option>
              <option value="SY">Second Year (SY)</option>
              <option value="TY">Third Year (TY)</option>
              <option value="BTech">Final Year (B.Tech)</option>
            </select>
          </div>

          {/* Data Table */}
          <div className="mt-5 overflow-hidden rounded-2xl border-2 border-ink/20">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-ink/20 bg-gfg-tint text-xs font-extrabold uppercase tracking-wide text-ink">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Student Name & Email</th>
                    <th className="px-4 py-3">Branch</th>
                    <th className="px-4 py-3">Year</th>
                    <th className="px-4 py-3">Feedback</th>
                    <th className="px-4 py-3 text-right">Check-in Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gfg/20 bg-white text-sm">
                  {filteredAttendees.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-ink/60 font-medium">
                        {attendees.length === 0 ? (
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-2xl">📋</span>
                            <p className="font-bold text-base text-ink">No attendance records yet</p>
                            <p className="text-xs text-ink/60">
                              Start attendance and display the QR code on the projector.
                            </p>
                          </div>
                        ) : (
                          <p className="font-semibold">No students match your filter criteria.</p>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredAttendees.map((a, index) => (
                      <tr key={a.id} className="hover:bg-paper/60 transition-colors">
                        <td className="px-4 py-3.5 font-mono text-xs font-bold text-ink/40">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-extrabold text-ink">{a.name}</p>
                          <p className="font-mono text-xs font-medium text-ink/60">{a.email}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-block rounded-lg border border-gfg/40 bg-gfg-tint px-2.5 py-1 text-xs font-bold text-gfg-deep">
                            {a.branch}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-block rounded-lg border border-ink/20 bg-paper px-2 py-0.5 text-xs font-extrabold text-ink">
                            {a.year}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 max-w-xs">
                          {a.feedback ? (
                            <button
                              onClick={() => setActiveFeedbackModal({ name: a.name, feedback: a.feedback })}
                              className="text-left text-xs font-medium text-ink/80 hover:text-gfg truncate block max-w-[16rem] cursor-pointer"
                              title="Click to view full feedback"
                            >
                              "{a.feedback}"
                            </button>
                          ) : (
                            <span className="text-ink/30 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-xs font-bold text-ink/70">
                          {a.at
                            ? a.at.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })
                            : "now"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Feedback Popup Modal */}
        {activeFeedbackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-3xl border-[3px] border-ink bg-white p-6 shadow-pop-ink animate-pop">
              <div className="flex items-center justify-between border-b border-gfg/30 pb-3">
                <h3 className="text-lg font-extrabold text-ink">
                  Feedback from {activeFeedbackModal.name}
                </h3>
                <button
                  onClick={() => setActiveFeedbackModal(null)}
                  className="rounded-full border-2 border-ink p-1 text-ink hover:bg-paper"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-4 max-h-60 overflow-y-auto rounded-2xl border-2 border-ink/20 bg-paper p-4 text-sm font-medium text-ink">
                "{activeFeedbackModal.feedback}"
              </div>
              <button
                onClick={() => setActiveFeedbackModal(null)}
                className="mt-5 w-full rounded-2xl border-[3px] border-ink bg-gfg py-2.5 text-sm font-bold text-white shadow-pop-ink"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <DotGrid className="mt-10 h-10 w-auto opacity-60" />
        <p className="mt-2 text-xs font-medium text-ink/40">Signed in as {user.email}</p>
      </div>
    </Shell>
  );
}

export default function Admin() {
  const { user, isAdmin, loading, error, login, logout } = useAuth();

  if (loading) {
    return (
      <Shell>
        <div className="grid min-h-screen place-items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-[5px] border-gfg-tint border-t-gfg" />
        </div>
      </Shell>
    );
  }
  if (!user) return <Login onLogin={login} error={error} />;
  if (!isAdmin) return <Denied email={user.email} onLogout={logout} />;
  return <Dashboard user={user} onLogout={logout} />;
}
