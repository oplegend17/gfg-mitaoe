import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Brand from "../components/Brand.jsx";
import { CornerTriangles, DotGrid } from "../components/Decor.jsx";
import { SUB_TEAM_MEMBERS } from "../data/subTeamData.js";

export default function SubTeamMembers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYearFilter, setSelectedYearFilter] = useState("all");

  // Normalize year tag display (e.g., "First Year" -> "FY", "Second Year" -> "SY", "Third Year" -> "TY")
  const getYearBadge = (year) => {
    if (!year) return "Member";
    const lower = year.toLowerCase();
    if (lower.includes("first")) return "FY";
    if (lower.includes("second")) return "SY";
    if (lower.includes("third")) return "TY";
    return year;
  };

  const filteredMembers = useMemo(() => {
    return SUB_TEAM_MEMBERS.filter((m) => {
      const matchesSearch =
        !searchQuery.trim() ||
        m.name.toLowerCase().includes(searchQuery.trim().toLowerCase());

      if (!matchesSearch) return false;

      if (selectedYearFilter === "all") return true;
      const badge = getYearBadge(m.year);
      return badge === selectedYearFilter;
    });
  }, [searchQuery, selectedYearFilter]);

  const yearCounts = useMemo(() => {
    const counts = { all: SUB_TEAM_MEMBERS.length, FY: 0, SY: 0, TY: 0 };
    SUB_TEAM_MEMBERS.forEach((m) => {
      const b = getYearBadge(m.year);
      if (counts[b] !== undefined) counts[b]++;
    });
    return counts;
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-paper px-4 pb-16 pt-8 text-ink sm:px-6">
      {/* Neo-Brutalist decorative corners */}
      <CornerTriangles className="pointer-events-none absolute -left-2 -top-2 h-36 w-36" />
      <CornerTriangles className="pointer-events-none absolute -bottom-2 -right-2 h-36 w-36" flip />
      <DotGrid className="pointer-events-none absolute right-8 top-8 h-12 w-auto opacity-70" />

      <div className="relative mx-auto max-w-5xl">
        {/* Top Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gfg/30 pb-6">
          <Brand size="lg" />

          <Link
            to="/results"
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-ink bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-ink shadow-pop-sm transition-all hover:bg-paper active:translate-x-0.5 active:translate-y-0.5"
          >
            ← Back to Results
          </Link>
        </header>

        {/* Hero Section */}
        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-xs font-bold tracking-widest text-ink/60 uppercase">
              SELECTION ROSTER / SUB TEAM INTAKE 2026
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-gfg bg-gfg-tint px-3 py-1 font-mono text-xs font-extrabold text-gfg-deep">
              {SUB_TEAM_MEMBERS.length} Total Members
            </span>
          </div>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">
            SUB TEAM <span className="text-gfg">MEMBERS</span>
          </h1>
          <p className="mt-2 text-sm font-semibold text-ink/70 sm:text-base">
            Official selection list of domain enthusiasts and contributors across all specialized technical & community verticals.
          </p>
        </div>

        {/* Search & Year Filter Controls */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search member by name..."
              className="w-full rounded-2xl border-[2.5px] border-ink bg-white py-3 pl-11 pr-4 text-sm font-semibold text-ink placeholder:text-ink/40 shadow-pop-sm focus:border-gfg focus:outline-none transition-colors"
            />
            <svg
              className="absolute left-4 top-3.5 h-4 w-4 text-ink/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Year Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: `All (${yearCounts.all})` },
              { id: "FY", label: `FY (${yearCounts.FY})` },
              { id: "SY", label: `SY (${yearCounts.SY})` },
              { id: "TY", label: `TY (${yearCounts.TY})` },
            ].map((tab) => {
              const active = selectedYearFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedYearFilter(tab.id)}
                  className={`rounded-xl border-2 px-3.5 py-2 text-xs font-extrabold transition-all cursor-pointer ${
                    active
                      ? "border-ink bg-ink text-white shadow-pop-ink"
                      : "border-ink/30 bg-white text-ink hover:border-ink shadow-pop-sm"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Members Count Strip */}
        <div className="mt-6 flex items-center justify-between rounded-xl border-2 border-ink bg-[#1a1e1b] px-4 py-2.5 text-xs font-extrabold tracking-wider text-white uppercase">
          <span>SELECTED SUB-TEAM MEMBERS</span>
          <span>Showing {filteredMembers.length} of {SUB_TEAM_MEMBERS.length}</span>
        </div>

        {/* Member Cards Grid */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member, idx) => {
            const badge = getYearBadge(member.year);
            return (
              <div
                key={member.name + idx}
                className="group flex items-center justify-between overflow-hidden rounded-2xl border-[2.5px] border-ink bg-white p-3.5 shadow-pop-sm transition-all hover:-translate-y-0.5 hover:shadow-pop-ink"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border-2 border-ink bg-paper font-mono text-xs font-extrabold text-ink group-hover:bg-gfg group-hover:text-white transition-colors">
                    {String(member.srNo || idx + 1).padStart(2, "0")}
                  </span>
                  <div className="truncate">
                    <p className="truncate text-sm font-extrabold text-ink group-hover:text-gfg-deep transition-colors">
                      {member.name}
                    </p>
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-lg border px-2.5 py-1 font-mono text-xs font-extrabold uppercase ${
                    badge === "FY"
                      ? "border-sky-500 bg-sky-50 text-sky-800"
                      : badge === "SY"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                      : badge === "TY"
                      ? "border-purple-500 bg-purple-50 text-purple-800"
                      : "border-ink/30 bg-paper text-ink/70"
                  }`}
                >
                  {badge}
                </span>
              </div>
            );
          })}
        </div>

        {filteredMembers.length === 0 && (
          <div className="mt-8 rounded-2xl border-2 border-dashed border-ink/30 bg-white p-8 text-center">
            <p className="text-sm font-bold text-ink/60">
              No member matching &ldquo;{searchQuery}&rdquo; in this filter.
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 flex flex-wrap items-center justify-between border-t border-gfg/30 pt-4 text-xs font-bold text-ink/60">
          <span>GFG Campus Body · MIT Academy of Engineering</span>
          <span>Sub Team Roster 2026</span>
        </footer>
      </div>
    </main>
  );
}

