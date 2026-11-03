import { useState, useEffect } from "react";
import Brand from "./Brand.jsx";
import { CornerTriangles, DotGrid } from "./Decor.jsx";

export default function GlitchLoader() {
  const [progress, setProgress] = useState(24);
  const [stalled, setStalled] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [retryNotice, setRetryNotice] = useState("");

  // Smooth progressive loading that stalls realistically at 99%
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev < 65) return prev + Math.floor(Math.random() * 8 + 4);
        if (prev < 90) return prev + Math.floor(Math.random() * 5 + 2);
        if (prev < 99) return prev + 1;
        setStalled(true);
        clearInterval(timer);
        return 99;
      });
    }, 220);

    return () => clearInterval(timer);
  }, []);

  const handleRetry = () => {
    setRetrying(true);
    setRetryNotice("");
    setTimeout(() => {
      setRetrying(false);
      setRetryNotice(
        "Gateway Response [504]: Upstream synchronization stalled. The final roster payload is awaiting administrative clearance. Please check back shortly."
      );
    }, 1800);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-paper px-4 py-8 text-ink sm:px-6">
      {/* Decorative Neo-Brutalist elements */}
      <CornerTriangles className="pointer-events-none absolute -left-2 -top-2 h-32 w-32" />
      <CornerTriangles className="pointer-events-none absolute -bottom-2 -right-2 h-32 w-32" flip />
      <DotGrid className="pointer-events-none absolute right-6 top-6 h-12 w-auto opacity-70" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col justify-between">
        {/* Brand header */}
        <header className="flex items-center justify-between border-b border-gfg/30 pb-4">
          <Brand size="md" />
          <span className="flex items-center gap-1.5 rounded-full border-2 border-sun bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900">
            <span className="h-2 w-2 rounded-full bg-sun animate-pulse" />
            SYNCHRONIZING
          </span>
        </header>

        {/* Central Card */}
        <div className="my-auto py-6">
          <section className="rounded-3xl border-[3px] border-ink bg-white p-6 sm:p-8 shadow-pop-ink">
            {/* Top status indicator */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-ink/10 pb-4">
              <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-gfg-deep">
                OFFICIAL SELECTION DISPATCH
              </span>
              <span className="font-mono text-xs font-bold text-ink/50">
                PORTAL SESSION 2026
              </span>
            </div>

            {/* Title */}
            <div className="mt-6 text-center">
              <h1 className="text-2xl font-extrabold uppercase tracking-tight text-ink sm:text-3xl">
                Recruitment Verdict 2026
              </h1>
              <p className="mt-1 text-xs font-semibold text-ink/60">
                Technical, Management & Creative Wings
              </p>
            </div>

            {/* Realistic Progress Bar */}
            <div className="mt-7">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-ink/75">
                <span>VERIFYING SELECTION ROSTER</span>
                <span className={stalled ? "text-alert font-extrabold glitch-flicker" : "text-gfg"}>
                  {progress}% {stalled ? "[STALLED]" : ""}
                </span>
              </div>

              <div className="mt-2 h-4 w-full overflow-hidden rounded-full border-2 border-ink bg-paper p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    stalled ? "bg-sun animate-pulse" : "bg-gfg"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Server Status Telemetry Box */}
            <div className="mt-6 rounded-2xl border-2 border-ink/20 bg-paper p-4 font-mono text-xs space-y-2">
              <div className="flex justify-between border-b border-ink/10 pb-1.5">
                <span className="text-ink/50">Service Pipeline</span>
                <span className="font-bold text-ink">gfg-mitaoe-verdict.internal</span>
              </div>
              <div className="flex justify-between border-b border-ink/10 pb-1.5">
                <span className="text-ink/50">Connection State</span>
                <span className="font-bold text-alert">
                  {stalled ? "504 Gateway Timeout (Awaiting Release)" : "Synchronizing Packets..."}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/50">Security Clearance</span>
                <span className="font-bold text-gfg">SHA-256 Validated</span>
              </div>
            </div>

            {/* Professional Alert Notice */}
            <div className="mt-6 rounded-2xl border-2 border-dashed border-sun bg-amber-50/70 p-4">
              <p className="text-xs font-semibold text-amber-950 leading-relaxed">
                <strong className="font-extrabold">System Notice:</strong> High concurrent traffic detected on the recruitment server. Roster payloads across all departments are currently undergoing final administrative validation.
              </p>
            </div>

            {/* Reconnection Response Message */}
            {retryNotice && (
              <div className="mt-4 rounded-xl border border-alert/30 bg-red-50 p-3 text-xs font-medium text-alert">
                {retryNotice}
              </div>
            )}

            {/* Clean Reconnection Button */}
            <div className="mt-6">
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="w-full rounded-2xl border-[3px] border-ink bg-gfg py-3 px-5 text-center text-sm font-extrabold text-white shadow-pop-ink transition-transform active:translate-x-0.5 active:translate-y-0.5 hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {retrying ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Re-establishing upstream connection...</span>
                  </>
                ) : (
                  <span>Retry Server Connection ⟳</span>
                )}
              </button>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between border-t border-gfg/30 pt-4 text-xs font-bold text-ink/60">
          <span>GFG CAMPUS BODY · MITAOE</span>
          <span>RECRUITMENT 2026</span>
        </footer>
      </div>
    </main>
  );
}
