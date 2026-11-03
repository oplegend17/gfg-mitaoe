import { useState, useEffect } from "react";
import Brand from "./Brand.jsx";
import { CornerTriangles, DotGrid } from "./Decor.jsx";

const FAKE_TERMINAL_LOGS = [
  "INITIALIZING GFG_SECURE_VERDICT_PIPELINE v2.4.1...",
  "CONNECTING TO CAMPUS_BODY_SELECTION_DB [PORT 8080]... OK",
  "DECRYPTING CANDIDATE_ROSTER.enc WITH RSA_4096... OK",
  "COMPUTING MERIT MATRICES FOR TECH, MANAGEMENT & SOCIAL...",
  "WARN: MEMORY LEAK DETECTED AT ADDRESS 0x7FFF004B2",
  "FATAL: STACK BUFFER OVERFLOW IN selection_evaluator.so",
  "ERR_TABLE_CORRUPT: candidate_verdict.db index scrambled!",
  "CRITICAL 0xDEADBEEF: Unhandled Kernel Panic in cluster #09",
  "AUTO-RECOVERY ROUTINE INITIALIZED...",
  "EMERGENCY SHUTDOWN PREVENTED... BARELY.",
];

export default function GlitchLoader() {
  const [progress, setProgress] = useState(12);
  const [stage, setStage] = useState("loading"); // 'loading' | 'glitch' | 'failed'
  const [terminalIndex, setTerminalIndex] = useState(2);
  const [rebootCount, setRebootCount] = useState(0);
  const [panicMsg, setPanicMsg] = useState("");
  const [isRebooting, setIsRebooting] = useState(false);

  // Fake progressive loading that breaks at 99.4%
  useEffect(() => {
    if (stage !== "loading") return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev < 45) return prev + Math.floor(Math.random() * 8 + 3);
        if (prev < 88) return prev + Math.floor(Math.random() * 6 + 2);
        if (prev < 99) return prev + 1;
        // Hit the wall at 99%!
        clearInterval(timer);
        setTimeout(() => {
          setStage("glitch");
        }, 600);
        return 99;
      });
    }, 180);

    return () => clearInterval(timer);
  }, [stage, rebootCount]);

  // Terminal log stream
  useEffect(() => {
    if (stage === "loading" && terminalIndex < FAKE_TERMINAL_LOGS.length) {
      const logTimer = setTimeout(() => {
        setTerminalIndex((prev) => prev + 1);
      }, 500);
      return () => clearTimeout(logTimer);
    }
  }, [stage, terminalIndex]);

  // Handle fake emergency reboot
  const handleFakeReboot = () => {
    setIsRebooting(true);
    setPanicMsg("Triggering emergency cold reboot...");

    setTimeout(() => {
      setIsRebooting(false);
      setRebootCount((c) => c + 1);
      const jokes = [
        "FATAL: Coffee spill detected on Server Shard #04. Please blow into your charging port and retry.",
        "ERROR 418: Server is currently a teapot. Results might be delayed by 1 hour.",
        "SYSTEM ALERT: Atharva Baodhankar & Ajinkya Magar are currently in the server room wrestling with the mainframe.",
        "CRITICAL: Selection database wiped! Just kidding... or are we? Check back shortly.",
        "DISASTER: Interview round 2 scheduled tomorrow morning at 6:00 AM sharp! (Refresh to cancel)",
      ];
      setPanicMsg(jokes[Math.floor(Math.random() * jokes.length)]);
      setStage("glitch");
    }, 2000);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-paper text-ink">
      {/* Scanline overlay for cyber glitch feel */}
      <div className="scanline-overlay pointer-events-none fixed inset-0 z-40 opacity-40" />

      {/* Brutalist accents */}
      <CornerTriangles className="pointer-events-none absolute -left-2 -top-2 h-32 w-32" />
      <CornerTriangles className="pointer-events-none absolute -bottom-2 -right-2 h-32 w-32" flip />
      <DotGrid className="pointer-events-none absolute right-6 top-6 h-12 w-auto opacity-70" />

      <div className="relative z-30 mx-auto flex min-h-screen max-w-2xl flex-col justify-between px-4 py-8">
        {/* Brand header */}
        <header className="flex items-center justify-between">
          <Brand size="md" />
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border-2 border-alert bg-red-100 px-3 py-1 text-xs font-extrabold text-alert">
              <span className="h-2 w-2 animate-ping rounded-full bg-alert" />
              SYSTEM ANOMALY
            </span>
          </div>
        </header>

        {/* Central Glitch Area */}
        <div className="my-auto py-8">
          {/* Main Glitch Container */}
          <div className="relative rounded-3xl border-[3px] border-ink bg-white p-6 sm:p-8 shadow-pop-ink">
            {/* Top error badge */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-ink/20 pb-4">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg border-2 border-ink bg-alert font-mono text-sm font-bold text-white">
                  ✕
                </span>
                <span className="font-mono text-xs font-extrabold tracking-wider text-alert uppercase">
                  ERR_CORRUPTED_INDEX :: STACK_TRACE_DUMP
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-ink/60">03-NOV-2026 // 22:12 UTC</span>
            </div>

            {/* Big Headline with Glitch Effect */}
            <div className="mt-6 text-center">
              <h1 className="glitch-text text-3xl font-extrabold uppercase tracking-tight text-ink sm:text-4xl">
                RECRUITMENT VERDICT 2026
              </h1>
              <p className="mt-2 font-mono text-xs font-bold text-alert glitch-flicker">
                ⚠️ [CRITICAL ARCHIVE FAULT]: CANNOT DECRYPT SELECTION ROSTER
              </p>
            </div>

            {/* Progress bar that fails at 99% */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-ink/75">
                <span>VERIFYING CANDIDATE DATA PACKETS</span>
                <span className="text-alert">{progress}% {progress === 99 ? "[STALLED]" : ""}</span>
              </div>
              <div className="mt-2 h-5 w-full overflow-hidden rounded-xl border-2 border-ink bg-paper p-0.5">
                <div
                  className={`h-full rounded-lg transition-all duration-300 ${
                    stage === "glitch" ? "bg-alert animate-pulse" : "bg-gfg"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Hacker / Server Terminal Screen */}
            <div className="mt-6 rounded-2xl border-2 border-ink bg-[#141816] p-4 text-left font-mono text-xs text-[#39ff14] shadow-inner">
              <div className="flex items-center gap-1.5 border-b border-[#2f8d46]/40 pb-2 text-[10px] text-gray-400">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span className="h-2 w-2 rounded-full bg-yellow-500" />
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="ml-2">terminal@gfg-mitaoe-edge: /var/log/verdict.panic</span>
              </div>

              <div className="mt-3 space-y-1 overflow-x-auto">
                {FAKE_TERMINAL_LOGS.slice(0, terminalIndex).map((line, idx) => (
                  <p
                    key={idx}
                    className={
                      line.includes("FATAL") || line.includes("ERR") || line.includes("CRITICAL")
                        ? "text-red-400 font-bold"
                        : line.includes("WARN")
                        ? "text-yellow-300"
                        : "text-[#39ff14]"
                    }
                  >
                    {">"} {line}
                  </p>
                ))}
                {stage === "glitch" && (
                  <p className="text-red-400 animate-pulse font-bold">
                    {">"} [CORE DUMPED]: Verdict hashes failed checksum. Candidate identities randomized.
                  </p>
                )}
                {panicMsg && (
                  <p className="mt-2 rounded border border-yellow-400/50 bg-yellow-950/40 p-2 text-yellow-300">
                    ⚡ {panicMsg}
                  </p>
                )}
              </div>
            </div>

            {/* Interactive Prank Controls */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleFakeReboot}
                disabled={isRebooting}
                className="flex-1 rounded-2xl border-[3px] border-ink bg-alert py-3 px-4 text-center font-bold text-white shadow-pop-ink transition-transform active:translate-x-0.5 active:translate-y-0.5 hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
              >
                {isRebooting ? "Attempting Reboot..." : "⚡ Emergency Server Reboot"}
              </button>

              <button
                onClick={() => {
                  alert(
                    "ORGANIZER ALERT SENT!\n\nAtharva Baodhankar and the Core Team have received your distress signal.\nPlease hold tight while they fix the broken mainframe!"
                  );
                }}
                className="rounded-2xl border-[3px] border-ink bg-paper py-3 px-5 text-center font-bold text-ink shadow-pop-ink transition-transform active:translate-x-0.5 active:translate-y-0.5 hover:-translate-y-0.5 cursor-pointer"
              >
                Paging Atharva 📟
              </button>
            </div>

            {/* Note to visitors */}
            <div className="mt-6 rounded-2xl border-2 border-dashed border-ink/40 bg-sun/20 p-4 text-center">
              <p className="text-xs font-bold text-ink">
                👀 <span className="font-extrabold">Notice for Applicants:</span> We are currently experiencing a technical anomaly while rendering the final list.
                Please stay patient and keep checking this page!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex flex-wrap items-center justify-between border-t border-gfg/30 pt-4 text-xs font-bold text-ink/60">
          <span>GFG CAMPUS BODY · MITAOE</span>
          <span>RECRUITMENT PORTAL 2026</span>
        </footer>
      </div>
    </main>
  );
}
