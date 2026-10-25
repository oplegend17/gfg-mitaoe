import { useAttendanceMark } from "../hooks/useAttendanceMark.js";
import { EVENT } from "../config/firebase.js";
import Brand from "../components/Brand.jsx";
import { CornerTriangles, DotGrid, Sparkle } from "../components/Decor.jsx";

const COPY = {
  success: {
    tone: "ok",
    title: "You're in!",
    body: "Your attendance is marked. Enjoy the orientation.",
  },
  already: {
    tone: "ok",
    title: "Already counted",
    body: "This phone has already marked attendance. Nothing more to do.",
  },
  closed: {
    tone: "warn",
    title: "Attendance is closed",
    body: "Check with a volunteer at the venue and they will open it for you.",
  },
  error: {
    tone: "warn",
    title: "Couldn't reach the server",
    body: "Check your internet connection and try again.",
  },
};

function StatusIcon({ tone }) {
  if (tone === "ok") {
    return (
      <div className="animate-pop grid h-28 w-28 place-items-center rounded-full border-[3px] border-ink bg-gfg shadow-pop-ink">
        <svg viewBox="0 0 52 52" className="h-14 w-14" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
          <path className="check-path" d="M12 27 l10 10 l19 -22" />
        </svg>
      </div>
    );
  }
  return (
    <div className="animate-pop grid h-28 w-28 place-items-center rounded-full border-[3px] border-ink bg-sun shadow-pop-ink">
      <span className="text-5xl font-extrabold text-ink">!</span>
    </div>
  );
}

export default function Student() {
  const { status, retry } = useAttendanceMark();
  const copy = COPY[status];

  return (
    <main className="relative min-h-screen overflow-hidden bg-paper px-5 pb-10 pt-6">
      <CornerTriangles className="pointer-events-none absolute -left-2 -top-2 h-28 w-28" />
      <CornerTriangles className="pointer-events-none absolute -bottom-2 -right-2 h-28 w-28" flip />
      <DotGrid className="pointer-events-none absolute right-4 top-6 h-12 w-auto opacity-80" />

      <div className="relative mx-auto flex max-w-md flex-col items-center">
        <div className="mt-6">
          <Brand />
        </div>
        <div className="mt-5 h-px w-full bg-gfg/40" />

        <section
          aria-live="polite"
          className="mt-8 w-full rounded-3xl border-[3px] border-gfg-deep bg-white px-6 py-9 text-center shadow-pop"
        >
          {status === "loading" ? (
            <div className="flex flex-col items-center gap-5 py-6">
              <div className="h-14 w-14 animate-spin rounded-full border-[5px] border-gfg-tint border-t-gfg" />
              <p className="text-lg font-bold">Marking your attendance</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <StatusIcon tone={copy.tone} />
              <h1 className="mt-6 text-3xl font-extrabold leading-tight text-gfg">{copy.title}</h1>
              <p className="mx-auto mt-3 max-w-[18rem] text-base font-medium text-ink/75">{copy.body}</p>
              {status === "error" && (
                <button
                  onClick={retry}
                  className="mt-6 rounded-2xl border-[3px] border-ink bg-gfg px-7 py-3 text-base font-bold text-white shadow-pop-ink active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  Try again
                </button>
              )}
            </div>
          )}
        </section>

        <section className="relative mt-8 w-full rounded-2xl border-2 border-gfg/50 bg-gfg-tint px-6 py-5">
          <Sparkle className="absolute right-4 top-3 h-7 w-7" />
          <p className="text-base font-bold">
            <span className="text-ink/60">Date:</span> {EVENT.date}
          </p>
          <p className="mt-1 text-base font-bold">
            <span className="text-ink/60">Time:</span> {EVENT.time}
          </p>
          <p className="mt-1 text-base font-bold">
            <span className="text-ink/60">Venue:</span> {EVENT.venue}
          </p>
        </section>

      
      </div>
    </main>
  );
}
