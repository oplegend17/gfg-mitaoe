import { useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../hooks/useAuth.js";
import { useAttendanceAdmin } from "../hooks/useAttendanceAdmin.js";
import { EVENT, PUBLIC_URL } from "../config/firebase.js";
import Brand from "../components/Brand.jsx";
import { CornerTriangles, DotGrid } from "../components/Decor.jsx";

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
  const { count, recent, open, error, setSessionOpen, resetCount } = useAttendanceAdmin(true);
  const [busy, setBusy] = useState(false);
  const joinUrl = PUBLIC_URL;

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

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-6 py-6">
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

        <div className="mt-8 grid items-center gap-10 lg:grid-cols-[minmax(0,26rem)_1fr]">
          {/* QR for the projector */}
          <section className="relative mx-auto w-full max-w-[26rem]">
            <div className="absolute -top-4 left-6 z-10 rounded-t-xl border-[3px] border-b-0 border-gfg-deep bg-gfg px-5 py-1.5 text-lg font-bold text-white">
              scan to join
            </div>
            <div className="rounded-3xl border-[3px] border-gfg-deep bg-white p-6 shadow-pop">
              <QRCodeSVG value={joinUrl} size={512} level="M" marginSize={0} className="h-auto w-full" />
            </div>
            <p className="mt-5 text-center text-sm font-semibold text-ink/60">
              {EVENT.date} · {EVENT.time} · Venue {EVENT.venue}
            </p>
          </section>

          {/* Live count */}
          <section>
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
              <span className="block">Students checked in</span>
              <span className="block text-gfg">GfG orientation</span>
            </h1>

            <div className="pointer-events-none mt-4 flex select-none items-baseline gap-4">
              <span
                key={count}
                aria-live="polite"
                className="animate-tick text-[clamp(4.5rem,10vw,8rem)] font-extrabold leading-none tabular-nums text-gfg"
              >
                {count}
              </span>
              <span className="text-lg font-bold uppercase tracking-wider text-ink/50 sm:text-xl">
                students checked in
              </span>
            </div>

            {error && (
              <p role="alert" className="mt-4 rounded-xl border-2 border-alert bg-white px-4 py-2 text-sm font-semibold text-alert">
                {error}
              </p>
            )}

            <div className="relative z-20 mt-6 flex flex-wrap gap-3">
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
              <button onClick={toggleFullscreen} className={`${btnBase} bg-white`}>Full screen</button>
              <button
                disabled={busy}
                onClick={onReset}
                className={`${btnBase} transition-colors ${
                  confirmReset
                    ? "bg-alert text-white animate-pulse border-alert"
                    : "bg-white text-alert"
                }`}
              >
                {confirmReset ? "Click to confirm reset" : "Reset count"}
              </button>
              <button onClick={onLogout} className={`${btnBase} bg-white`}>Sign out</button>
            </div>

            <div className="mt-8">
              <h2 className="text-base font-bold">Latest check-ins</h2>
              {recent.length === 0 ? (
                <p className="mt-2 text-sm font-medium text-ink/60">
                  No one yet. Start attendance, then show the QR code.
                </p>
              ) : (
                <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {recent.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-center justify-between rounded-xl border-2 border-gfg/40 bg-gfg-tint px-4 py-2 text-sm font-semibold"
                    >
                      <span>Phone …{r.id.slice(-4)}</span>
                      <span className="tabular-nums text-ink/60">
                        {r.at ? r.at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "now"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

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
