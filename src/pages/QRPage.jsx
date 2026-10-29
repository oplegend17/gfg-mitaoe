import { useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../hooks/useAuth.js";
import { useAttendanceAdmin } from "../hooks/useAttendanceAdmin.js";
import { EVENT, PUBLIC_URL } from "../config/firebase.js";
import Brand from "../components/Brand.jsx";
import { CornerTriangles, DotGrid, Sparkle } from "../components/Decor.jsx";

export default function QRPage() {
  const { user, isAdmin } = useAuth();
  // Listen to attendance count and session state if authenticated
  const { count, open } = useAttendanceAdmin(!!user && isAdmin);
  const [copied, setCopied] = useState(false);

  const joinUrl = PUBLIC_URL || (typeof window !== "undefined" ? window.location.origin : "");

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      document.documentElement.requestFullscreen?.();
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-paper px-6 py-8 text-ink">
      {/* Decorative neo-brutalist accents */}
      <CornerTriangles className="pointer-events-none absolute -left-2 -top-2 h-36 w-36" />
      <CornerTriangles className="pointer-events-none absolute -bottom-2 -right-2 h-36 w-36" flip />
      <DotGrid className="pointer-events-none absolute right-8 top-8 h-14 w-auto opacity-70" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-between">
        {/* Top Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Brand size="lg" />

          <div className="flex items-center gap-3">
            {open !== null && (
              <span
                className={`flex items-center gap-2 rounded-full border-[3px] border-ink px-4 py-1.5 text-sm font-bold shadow-pop-sm ${
                  open ? "bg-gfg text-white" : "bg-sun text-ink"
                }`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${open ? "animate-pulse bg-white" : "bg-ink"}`} />
                {open ? "Attendance Live" : "Attendance Closed"}
              </span>
            )}

            <button
              onClick={toggleFullscreen}
              className="rounded-2xl border-[3px] border-ink bg-white px-4 py-2 text-sm font-bold shadow-pop-ink transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              title="Toggle Fullscreen for Projector"
            >
              ⛶ Fullscreen
            </button>

            <Link
              to="/admin"
              className="rounded-2xl border-[3px] border-ink bg-gfg px-4 py-2 text-sm font-bold text-white shadow-pop-ink transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              Admin Dashboard →
            </Link>
          </div>
        </header>

        {/* Central Display */}
        <div className="my-auto grid items-center gap-10 py-6 lg:grid-cols-2">
          {/* QR Code Presentation Box */}
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-md">
              <div className="absolute -top-4 left-6 z-10 flex items-center gap-2 rounded-t-xl border-[3px] border-b-0 border-gfg-deep bg-gfg px-5 py-1.5 text-base font-extrabold uppercase tracking-wide text-white">
                <Sparkle className="h-4 w-4" />
                Scan to Check In
              </div>

              <div className="rounded-3xl border-[3px] border-gfg-deep bg-white p-7 shadow-pop">
                <div className="grid place-items-center rounded-2xl bg-white p-2">
                  <QRCodeSVG
                    value={joinUrl}
                    size={400}
                    level="Q"
                    marginSize={1}
                    className="h-auto max-h-[50vh] w-full"
                  />
                </div>
              </div>
            </div>

            <p className="mt-4 text-center text-sm font-bold text-ink/70">
              Point your phone camera at the QR code to register attendance.
            </p>
          </div>

          {/* Event Details & Live Progress */}
          <div className="flex flex-col justify-center space-y-6">
            <div>
              <span className="inline-block rounded-xl border-2 border-gfg/40 bg-gfg-tint px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-gfg-deep">
                Exclusive Session for MITAOE Students
              </span>
              <h1 className="mt-3 text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
                Flo101 <span className="text-gfg">Campus Session</span>
              </h1>
              <p className="mt-1 text-lg font-bold text-gfg-deep">
                Learn • Practice • Build with AI
              </p>
              <p className="mt-0.5 text-sm font-medium text-ink/70">
                Your AI-powered learning & building partner
              </p>

              {/* Perk Callout */}
              <div className="mt-4 rounded-2xl border-[2.5px] border-ink bg-amber-50 p-3.5 shadow-pop-sm">
                <p className="text-xs font-extrabold uppercase tracking-wider text-ink/60">
                  Exclusive Attendee Perk
                </p>
                <p className="text-base font-extrabold text-ink">
                  🎟️ Get FREE access worth <span className="text-gfg-deep underline">$200+</span>
                </p>
                <p className="mt-0.5 text-xs font-semibold text-ink/70">
                  5 top-tier AI tools for 2 months full access!
                </p>
              </div>
            </div>

            {isAdmin && (
              <div className="rounded-3xl border-[3px] border-ink bg-white p-6 shadow-pop-ink">
                <span className="text-sm font-bold uppercase tracking-wider text-ink/60">
                  Live Attendance Count
                </span>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="text-5xl font-extrabold tabular-nums text-gfg sm:text-6xl">{count}</span>
                  <span className="text-lg font-bold text-ink/70">Students Checked In</span>
                </div>
              </div>
            )}

            {/* Event Info Card */}
            <div className="rounded-2xl border-2 border-gfg/50 bg-gfg-tint p-5 font-semibold text-ink">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-bold uppercase text-ink/60">Date</p>
                  <p className="text-base font-extrabold">{EVENT.date}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-ink/60">Time</p>
                  <p className="text-base font-extrabold">{EVENT.time}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-ink/60">Venue</p>
                  <p className="text-base font-extrabold">{EVENT.venue}</p>
                </div>
              </div>
            </div>

            {/* Quick Link bar */}
            <div className="flex items-center gap-3">
              <span className="truncate rounded-xl border-2 border-ink/30 bg-white px-4 py-2 font-mono text-xs font-bold text-ink/80">
                {joinUrl}
              </span>
              <button
                onClick={copyUrl}
                className="shrink-0 rounded-xl border-2 border-ink bg-sun px-3.5 py-2 text-xs font-bold shadow-pop-sm active:translate-x-0.5 active:translate-y-0.5"
              >
                {copied ? "Copied!" : "Copy URL"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-4 flex items-center justify-between border-t border-gfg/30 pt-4 text-xs font-bold text-ink/60">
          <span>GeeksforGeeks Campus Body · MIT Academy of Engineering</span>
          <span>Attendance Portal</span>
        </footer>
      </div>
    </main>
  );
}
