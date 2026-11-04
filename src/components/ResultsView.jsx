import { useState } from "react";
import { Link } from "react-router-dom";
import confetti from "canvas-confetti";
import Brand from "./Brand.jsx";
import { CornerTriangles, DotGrid } from "./Decor.jsx";
import { RECRUITMENT_INFO, RECRUITMENT_TEAMS } from "../data/recruitmentData.js";
import { useSubTeamData } from "../hooks/useSubTeamData.js";

export default function ResultsView() {
  const { leads, members } = useSubTeamData();
  const [selectedTeamTab, setSelectedTeamTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  // Trigger celebration confetti
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#2f8d46", "#1e6b33", "#f5c842", "#26292b"],
    });
  };

  // Search through all candidate names (including sub-team leads & sub-team members)
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResult(null);
      return;
    }

    const clean = query.trim().toLowerCase();
    let found = null;

    // Check Sub Team Leads
    for (const lead of leads) {
      if (lead.name.toLowerCase().includes(clean)) {
        found = {
          name: lead.name,
          year: lead.year,
          rank: "LEAD",
          role: `${lead.domain} (${lead.role || "Lead"})`,
          teamName: "Sub Team Leads",
          shortTeam: "Sub Team",
        };
        break;
      }
    }

    // Check Core Recruitment Teams (Tech, Management, Social)
    if (!found) {
      for (const team of RECRUITMENT_TEAMS) {
        for (const group of team.groups) {
          for (const member of group.members) {
            if (member.name.toLowerCase().includes(clean)) {
              found = {
                name: member.name,
                year: member.year,
                rank: member.rank,
                role: member.role,
                teamName: team.name,
                shortTeam: team.shortName,
              };
              break;
            }
          }
          if (found) break;
        }
        if (found) break;
      }
    }

    // Check Sub Team Members
    if (!found) {
      for (const member of members) {
        if (member.name.toLowerCase().includes(clean)) {
          found = {
            name: member.name,
            year: member.year,
            rank: `#${member.srNo}`,
            role: "Sub Team Member",
            teamName: "Sub Team Technical & Community",
            shortTeam: "Sub Team",
            isSubTeamMember: true,
          };
          break;
        }
      }
    }

    setSearchResult(found);
    if (found && query.trim().length >= 4) {
      triggerConfetti();
    }
  };

  // Filter teams based on selected tab
  const displayedTeams =
    selectedTeamTab === "all"
      ? RECRUITMENT_TEAMS
      : RECRUITMENT_TEAMS.filter((t) => t.id === selectedTeamTab);

  const showSubTeamSection = selectedTeamTab === "all" || selectedTeamTab === "subteam";

  return (
    <main className="relative min-h-screen overflow-hidden bg-paper px-4 pb-16 pt-8 text-ink sm:px-6">
      {/* Decorative Neo-Brutalist elements */}
      <CornerTriangles className="pointer-events-none absolute -left-2 -top-2 h-36 w-36" />
      <CornerTriangles className="pointer-events-none absolute -bottom-2 -right-2 h-36 w-36" flip />
      <DotGrid className="pointer-events-none absolute right-8 top-8 h-12 w-auto opacity-70" />

      <div className="relative mx-auto max-w-6xl">
        {/* Top Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gfg/30 pb-6">
          <Brand size="lg" />

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-gfg bg-gfg-tint px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-gfg-deep">
              <span className="h-2 w-2 rounded-full bg-gfg animate-pulse" />
              Official Verdict Live
            </span>
          </div>
        </header>

        {/* Hero Title Section */}
        <div className="mt-8 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-xs font-bold tracking-widest text-ink/60 uppercase">
              OFFICIAL SELECTION ROSTER / {RECRUITMENT_INFO.verdictDate}
            </span>
            <span className="font-mono text-xs font-bold text-gfg">
              SESSION {RECRUITMENT_INFO.sessionYear}
            </span>
          </div>

          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-ink sm:text-6xl">
            RECRUITMENT <span className="text-gfg">VERDICT 2026</span>
          </h1>
          <p className="mt-2 text-base font-semibold text-ink/75 sm:text-lg">
            GeeksforGeeks Campus Body · {RECRUITMENT_INFO.college}
          </p>
        </div>

        {/* Candidate Instant Search */}
        <div className="mt-8 rounded-3xl border-[3px] border-ink bg-white p-5 sm:p-6 shadow-pop-ink">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search candidate name (e.g. Vaishnavi, Vishal, Abhishree, Omkar...)"
                className="w-full rounded-2xl border-2 border-ink/30 bg-paper py-3 pl-11 pr-4 text-sm font-semibold text-ink placeholder:text-ink/40 focus:border-gfg focus:bg-white focus:outline-none transition-colors"
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

            <button
              onClick={triggerConfetti}
              className="rounded-2xl border-2 border-ink bg-sun px-5 py-3 text-xs font-extrabold text-ink shadow-pop-sm transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            >
              🎉 Celebrate
            </button>
          </div>

          {/* Search Result Banner */}
          {searchQuery && (
            <div className="mt-4">
              {searchResult ? (
                <div className="rounded-2xl border-2 border-gfg bg-gfg-tint p-4 animate-pop">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl border-2 border-gfg-deep bg-gfg font-bold text-white shadow-pop-sm">
                        ✓
                      </span>
                      <div>
                        <p className="text-base font-extrabold text-gfg-deep">
                          Congratulations, {searchResult.name}! 🎉
                        </p>
                        <p className="text-xs font-semibold text-ink/75">
                          Selected for <span className="font-extrabold text-ink">{searchResult.teamName}</span> ({searchResult.year ? `${searchResult.year} • ` : ""}{searchResult.role})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-xl border border-gfg bg-white px-3 py-1 font-mono text-xs font-extrabold text-gfg-deep">
                        {searchResult.rank.startsWith("#") ? searchResult.rank : `Rank ${searchResult.rank}`}
                      </span>
                      {searchResult.isSubTeamMember && (
                        <Link
                          to="/subteam"
                          className="rounded-xl border border-ink bg-ink px-3 py-1 text-xs font-bold text-white hover:bg-gfg transition-colors"
                        >
                          View in Sub-Team List →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs font-semibold text-ink/50 italic px-2">
                  No match found in current selection roster. Check spelling or browse the rosters below.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Team Selector Tabs */}
        <div className="mt-8 flex flex-wrap gap-2.5">
          <button
            onClick={() => setSelectedTeamTab("all")}
            className={`rounded-2xl border-[2.5px] px-5 py-2.5 text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              selectedTeamTab === "all"
                ? "border-ink bg-ink text-white shadow-pop-ink"
                : "border-ink/30 bg-white text-ink hover:border-ink shadow-pop-sm"
            }`}
          >
            🌟 All Teams Roster
          </button>
          <button
            onClick={() => setSelectedTeamTab("subteam")}
            className={`rounded-2xl border-[2.5px] px-5 py-2.5 text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              selectedTeamTab === "subteam"
                ? "border-ink bg-gfg text-white shadow-pop-ink"
                : "border-ink/30 bg-white text-ink hover:border-ink shadow-pop-sm"
            }`}
          >
            ⚡ Sub Teams ({leads.length} Leads)
          </button>
          {RECRUITMENT_TEAMS.map((team) => {
            const isSelected = selectedTeamTab === team.id;
            return (
              <button
                key={team.id}
                onClick={() => setSelectedTeamTab(team.id)}
                className={`rounded-2xl border-[2.5px] px-5 py-2.5 text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                  isSelected
                    ? "border-ink bg-gfg text-white shadow-pop-ink"
                    : "border-ink/30 bg-white text-ink hover:border-ink shadow-pop-sm"
                }`}
              >
                {team.icon} {team.shortName} ({team.badge})
              </button>
            );
          })}
        </div>

        {/* Team Rosters Container */}
        <div className="mt-8 space-y-12">
          {/* 1. SUB TEAM SECTION (SHOWN FIRST) */}
          {showSubTeamSection && (
            <section className="rounded-3xl border-[3px] border-gfg-deep bg-white p-6 sm:p-8 shadow-pop">
              {/* Section Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-gfg/30 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">
                      Sub Team Domain Leads
                    </h2>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm font-semibold text-ink/65">
                    Domain heads leading specialized technical tracks, competitive programming, and initiatives
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full border-2 border-ink bg-gfg px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-pop-sm">
                    {leads.length} Leads Appointed
                  </span>
                </div>
              </div>

              {/* Sub-Team Leads Grid */}
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {leads.map((lead, idx) => {
                  const isPending = lead.status && lead.status.toLowerCase().includes("pending");
                  return (
                    <div
                      key={lead.id || lead.name + idx}
                      className="group flex flex-col justify-between overflow-hidden rounded-2xl border-[2.5px] border-ink bg-white p-4 shadow-pop-sm transition-all hover:-translate-y-0.5 hover:shadow-pop-ink"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          {/* Domain Badge */}
                          <div className="inline-block rounded-lg border border-gfg/50 bg-gfg-tint px-2.5 py-0.5 text-xs font-extrabold text-gfg-deep uppercase tracking-wide">
                            {lead.domain}
                          </div>
                          {/* Name */}
                          <h3 className="truncate text-base sm:text-lg font-extrabold text-ink group-hover:text-gfg-deep transition-colors">
                            {lead.name}
                          </h3>
                        </div>

                        {/* Role Pill */}
                        <div className="shrink-0 text-right flex items-center gap-1.5">
                          {lead.isCustom && (
                            <span className="rounded-md border border-sun bg-amber-50 px-1.5 py-0.5 font-mono text-[10px] font-extrabold text-amber-800">
                              NEW
                            </span>
                          )}
                          <span className="inline-block rounded-lg border-2 border-ink bg-ink px-2.5 py-0.5 font-mono text-xs font-extrabold text-white">
                            {lead.role || "Lead"}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Meta */}
                      <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-2.5 text-xs font-bold text-ink/60">
                        <span>
                          {lead.year || "Second Year"}{lead.branch ? ` · ${lead.branch}` : ""}
                        </span>
                        {isPending ? (
                          <span className="font-mono text-[11px] font-extrabold text-amber-600 uppercase">
                            Pending confirmation
                          </span>
                        ) : (
                          <span className="font-mono text-[11px] font-extrabold text-gfg-deep uppercase">
                            Confirmed
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Banner Linking to Sub Team Members Route */}
              <div className="mt-8 rounded-2xl border-[2.5px] border-ink bg-paper p-5 sm:p-6 shadow-pop-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">👥</span>
                    <h4 className="text-base sm:text-lg font-extrabold text-ink">
                      Sub Team Members List ({members.length} Selected)
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-ink/70 max-w-xl">
                    View the complete roster of sub-team members across First Year, Second Year, and Third Year.
                  </p>
                </div>

                <Link
                  to="/subteam"
                  className="inline-flex items-center gap-2 rounded-2xl border-2 border-ink bg-gfg px-5 py-3 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white shadow-pop-ink transition-transform hover:bg-gfg-deep active:translate-x-0.5 active:translate-y-0.5 cursor-pointer shrink-0"
                >
                  View Sub-Team Members →
                </Link>
              </div>
            </section>
          )}

          {/* 2. CORE TEAMS (TECH, MANAGEMENT, SOCIAL MEDIA) */}
          {displayedTeams.map((team) => (
            <section
              key={team.id}
              className="rounded-3xl border-[3px] border-gfg-deep bg-white p-6 sm:p-8 shadow-pop"
            >
              {/* Section Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-gfg/30 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{team.icon}</span>
                    <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">
                      {team.name}
                    </h2>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm font-semibold text-ink/65">
                    {team.tagline}
                  </p>
                </div>

                <span className="rounded-full border-2 border-ink bg-gfg px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-pop-sm">
                  {team.badge}
                </span>
              </div>

              {/* Group Columns */}
              <div className="mt-8 grid gap-8 md:grid-cols-2">
                {team.groups.map((group, gIdx) => (
                  <div key={gIdx} className="space-y-4">
                    {/* Top Intake Stats Card */}
                    <div className="rounded-2xl border-[2.5px] border-ink bg-white p-5 shadow-pop-ink">
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-extrabold tabular-nums text-ink">
                          {group.capacity.split(" ")[0]} / {group.capacity.split(" ")[2]}
                        </span>
                        <span className="text-xs font-bold text-ink/60">
                          {group.members.length} names listed
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-extrabold uppercase tracking-wider text-gfg-deep">
                        {group.year.toUpperCase()}
                      </p>
                    </div>

                    {/* Header strip */}
                    <div className="flex items-center justify-between rounded-xl border-2 border-ink bg-[#1a1e1b] px-4 py-2 text-xs font-extrabold tracking-wider text-white uppercase">
                      <span>{group.shortYear} INTAKE</span>
                      <span>{String(group.members.length).padStart(2, "0")}</span>
                    </div>

                    {/* Candidate Cards */}
                    <div className="space-y-2.5">
                      {group.members.map((member) => (
                        <div
                          key={member.rank}
                          className="group flex items-stretch overflow-hidden rounded-2xl border-[2.5px] border-ink bg-white shadow-pop-sm transition-all hover:-translate-y-0.5 hover:shadow-pop-ink"
                        >
                          {/* Number Tag */}
                          <div className="grid w-14 shrink-0 place-items-center border-r-[2.5px] border-ink bg-gfg font-mono text-sm font-extrabold text-white">
                            {member.rank}
                          </div>

                          {/* Candidate Info */}
                          <div className="flex flex-1 items-center justify-between px-4 py-3">
                            <div>
                              <p className="text-base font-extrabold text-ink group-hover:text-gfg-deep transition-colors">
                                {member.name}
                              </p>
                              <span className="text-xs font-bold uppercase text-ink/50">
                                {member.year}
                              </span>
                            </div>

                            <span className="rounded-lg border border-gfg/40 bg-gfg-tint px-2.5 py-0.5 font-mono text-[11px] font-extrabold text-gfg-deep uppercase">
                              {member.role || "SELECTED"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-8 flex flex-wrap items-center justify-between border-t border-gfg/30 pt-4 text-xs font-bold text-ink/60">
          <span>GFG Campus Body · MIT Academy of Engineering</span>
          <span>Recruitment Session 2026</span>
        </footer>
      </div>
    </main>
  );
}
