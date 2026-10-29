import { useState } from "react";
import { useAttendanceMark } from "../hooks/useAttendanceMark.js";
import { EVENT } from "../config/firebase.js";
import Brand from "../components/Brand.jsx";
import { CornerTriangles, DotGrid, Sparkle } from "../components/Decor.jsx";

const BRANCHES = [
  "Computer Engineering",
  "Information Technology",
  "AI & Data Science",
  "Electronics & Telecommunication (ENTC)",
  "Mechanical Engineering",
  "Chemical Engineering",
  "Civil Engineering",
  "Design / Other",
];

const YEARS = [
  { id: "FY", label: "First Year (FY)" },
  { id: "SY", label: "Second Year (SY)" },
  { id: "TY", label: "Third Year (TY)" },
  { id: "BTech", label: "Final Year (B.Tech)" },
];

function StatusBadge({ tone = "ok", icon = "check" }) {
  if (tone === "ok") {
    return (
      <div className="animate-pop grid h-24 w-24 place-items-center rounded-full border-[3px] border-ink bg-gfg shadow-pop-ink">
        <svg viewBox="0 0 52 52" className="h-12 w-12" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
          <path className="check-path" d="M12 27 l10 10 l19 -22" />
        </svg>
      </div>
    );
  }
  return (
    <div className="animate-pop grid h-24 w-24 place-items-center rounded-full border-[3px] border-ink bg-sun shadow-pop-ink">
      <span className="text-4xl font-extrabold text-ink">!</span>
    </div>
  );
}

export default function Student() {
  const { status, errorMessage, submittedInfo, submitAttendance, retry } = useAttendanceMark();

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [feedback, setFeedback] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    if (!name.trim()) {
      setValidationError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setValidationError("Please enter a valid email address.");
      return;
    }
    if (!branch.trim()) {
      setValidationError("Please enter your branch.");
      return;
    }
    if (!year) {
      setValidationError("Please select your year of study.");
      return;
    }

    await submitAttendance({
      name,
      email,
      branch,
      year,
      feedback,
    });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-paper px-4 pb-12 pt-6">
      {/* Decorative Neo-Brutalist elements */}
      <CornerTriangles className="pointer-events-none absolute -left-2 -top-2 h-28 w-28" />
      <CornerTriangles className="pointer-events-none absolute -bottom-2 -right-2 h-28 w-28" flip />
      <DotGrid className="pointer-events-none absolute right-4 top-6 h-12 w-auto opacity-70" />

      <div className="relative mx-auto flex max-w-lg flex-col items-center">
        {/* Header branding */}
        <div className="mt-4">
          <Brand size="md" />
        </div>
        <div className="mt-5 h-px w-full bg-gfg/40" />

        {/* 1. Checking Session State */}
        {status === "checking" && (
          <section className="mt-8 w-full rounded-3xl border-[3px] border-gfg-deep bg-white px-6 py-12 text-center shadow-pop">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-[5px] border-gfg-tint border-t-gfg" />
              <p className="text-base font-bold text-ink">Connecting to Flo101 Campus Session...</p>
            </div>
          </section>
        )}

        {/* 2. Session is Closed */}
        {status === "closed" && (
          <section className="mt-8 w-full rounded-3xl border-[3px] border-gfg-deep bg-white px-6 py-10 text-center shadow-pop">
            <div className="flex flex-col items-center">
              <StatusBadge tone="warn" />
              <h1 className="mt-6 text-3xl font-extrabold text-ink">Attendance is Closed</h1>
              <p className="mx-auto mt-3 max-w-sm text-base font-medium text-ink/75">
                Attendance for Flo101 hasn't opened yet or has ended.
                Please check with an organizer at {EVENT.venue}.
              </p>
              <button
                onClick={retry}
                className="mt-6 rounded-2xl border-[3px] border-ink bg-sun px-6 py-2.5 text-sm font-bold shadow-pop-ink transition-transform active:translate-x-0.5 active:translate-y-0.5"
              >
                Check again
              </button>
            </div>
          </section>
        )}

        {/* 3. Success State */}
        {status === "success" && (
          <section className="mt-8 w-full rounded-3xl border-[3px] border-gfg-deep bg-white px-6 py-10 text-center shadow-pop">
            <div className="flex flex-col items-center">
              <StatusBadge tone="ok" />
              <h1 className="mt-6 text-3xl font-extrabold leading-tight text-gfg">
                You're in, {submittedInfo?.name || "Friend"}!
              </h1>
              <p className="mx-auto mt-2 max-w-sm text-base font-medium text-ink/80">
                Your attendance is recorded for <span className="font-bold text-gfg-deep">Flo101 Campus Session</span>.
                Enjoy the session and get ready to claim your $200+ free AI tools access! ⚡
              </p>

              {submittedInfo && (
                <div className="mt-6 w-full rounded-2xl border-2 border-gfg/40 bg-gfg-tint p-4 text-left font-semibold text-sm">
                  <div className="flex justify-between border-b border-gfg/30 pb-2">
                    <span className="text-ink/60">Registered Name:</span>
                    <span className="font-bold text-ink">{submittedInfo.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-gfg/30 py-2">
                    <span className="text-ink/60">Branch & Year:</span>
                    <span className="font-bold text-ink">
                      {submittedInfo.branch} ({submittedInfo.year})
                    </span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-ink/60">Email:</span>
                    <span className="font-bold text-ink truncate max-w-[14rem]">{submittedInfo.email}</span>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 4. Already Counted State */}
        {status === "already" && (
          <section className="mt-8 w-full rounded-3xl border-[3px] border-gfg-deep bg-white px-6 py-10 text-center shadow-pop">
            <div className="flex flex-col items-center">
              <StatusBadge tone="ok" />
              <h1 className="mt-6 text-3xl font-extrabold text-gfg">Already Counted</h1>
              <p className="mx-auto mt-2 max-w-sm text-base font-medium text-ink/80">
                This phone has already checked in for the Flo101 session.
              </p>

              {submittedInfo?.name && (
                <div className="mt-5 inline-block rounded-2xl border-2 border-gfg/50 bg-gfg-tint px-5 py-2.5 text-sm font-bold text-ink">
                  Welcome back, <span className="text-gfg-deep">{submittedInfo.name}</span>!
                </div>
              )}
            </div>
          </section>
        )}

        {/* 5. Registration Form (Ready / Submitting / Form Error) */}
        {(status === "ready" || status === "submitting" || status === "error") && (
          <form
            onSubmit={handleSubmit}
            className="mt-8 w-full rounded-3xl border-[3px] border-gfg-deep bg-white p-6 sm:p-8 shadow-pop"
          >
            {/* Form Title Banner */}
            <div className="flex flex-col border-b border-gfg/30 pb-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-gfg/40 bg-gfg-tint px-3 py-0.5 text-xs font-extrabold uppercase tracking-wide text-gfg-deep">
                  <Sparkle className="h-3.5 w-3.5" />
                  Exclusive Session
                </span>
                <span className="text-xs font-bold text-ink/60">
                  {EVENT.venue}
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
                Flo101 Campus Session
              </h1>
              <p className="mt-1 text-sm font-semibold text-gfg-deep">
                Learn • Practice • Build with AI
              </p>
              
              {/* Perk Callout */}
              <div className="mt-3 rounded-xl border-2 border-sun bg-amber-50 px-3.5 py-2 text-xs font-bold text-ink">
                🎁 Attend & unlock <span className="text-gfg-deep font-extrabold">FREE access worth $200+</span> (5 AI tools for 2 months)!
              </div>
            </div>

            {/* Validation / Submission Error */}
            {(validationError || errorMessage) && (
              <div
                role="alert"
                className="mt-5 rounded-2xl border-2 border-alert bg-red-50 p-4 text-sm font-bold text-alert"
              >
                {validationError || errorMessage}
              </div>
            )}

            {/* Field: Full Name */}
            <div className="mt-5">
              <label htmlFor="student-name" className="block text-sm font-bold text-ink">
                Full Name <span className="text-alert">*</span>
              </label>
              <input
                id="student-name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Atharva Baodhankar"
                className="mt-1.5 w-full rounded-2xl border-2 border-ink/30 bg-paper px-4 py-3 text-base font-semibold text-ink placeholder:text-ink/40 focus:border-gfg focus:bg-white focus:outline-none transition-colors"
              />
            </div>

            {/* Field: Email ID */}
            <div className="mt-4">
              <label htmlFor="student-email" className="block text-sm font-bold text-ink">
                College / Personal Email <span className="text-alert">*</span>
              </label>
              <input
                id="student-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. name@mitaoe.ac.in"
                className="mt-1.5 w-full rounded-2xl border-2 border-ink/30 bg-paper px-4 py-3 text-base font-semibold text-ink placeholder:text-ink/40 focus:border-gfg focus:bg-white focus:outline-none transition-colors"
              />
            </div>

            {/* Field: Branch */}
            <div className="mt-4">
              <label htmlFor="student-branch" className="block text-sm font-bold text-ink">
                Branch <span className="text-alert">*</span>
              </label>
              <input
                id="student-branch"
                type="text"
                required
                list="branch-suggestions"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="e.g. Computer Engineering, IT, ENTC..."
                className="mt-1.5 w-full rounded-2xl border-2 border-ink/30 bg-paper px-4 py-3 text-base font-semibold text-ink placeholder:text-ink/40 focus:border-gfg focus:bg-white focus:outline-none transition-colors"
              />
              <datalist id="branch-suggestions">
                {BRANCHES.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>

            {/* Field: Year of Study */}
            <div className="mt-5">
              <label className="block text-sm font-bold text-ink">
                Year of Study <span className="text-alert">*</span>
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {YEARS.map((y) => {
                  const isSelected = year === y.id;
                  return (
                    <button
                      key={y.id}
                      type="button"
                      onClick={() => setYear(y.id)}
                      className={`rounded-xl border-[2.5px] p-2.5 text-center text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                        isSelected
                          ? "border-ink bg-gfg text-white shadow-pop-sm"
                          : "border-ink/30 bg-paper text-ink hover:border-ink"
                      }`}
                    >
                      {y.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Field: Optional Feedback */}
            <div className="mt-5">
              <div className="flex items-center justify-between">
                <label htmlFor="student-feedback" className="block text-sm font-bold text-ink">
                  Feedback or Expectations
                </label>
                <span className="text-xs font-bold uppercase text-ink/50">Optional</span>
              </div>
              <textarea
                id="student-feedback"
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                maxLength={400}
                placeholder="What are you most excited to learn or build with Flo101? Any questions for the team?"
                className="mt-1.5 w-full rounded-2xl border-2 border-ink/30 bg-paper px-4 py-3 text-sm font-medium text-ink placeholder:text-ink/40 focus:border-gfg focus:bg-white focus:outline-none transition-colors"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === "submitting"}
              className="mt-6 w-full rounded-2xl border-[3px] border-ink bg-gfg py-3.5 text-base font-extrabold text-white shadow-pop-ink transition-all active:translate-x-0.5 active:translate-y-0.5 hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {status === "submitting" ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-3 border-white border-t-transparent" />
                  <span>Recording attendance...</span>
                </>
              ) : (
                <span>Mark Attendance →</span>
              )}
            </button>

            <p className="mt-3 text-center text-xs font-semibold text-ink/50">
              Your response is securely recorded for the Flo101 MITAOE session.
            </p>
          </form>
        )}

        {/* Event Schedule Footer Badge */}
        <section className="relative mt-8 w-full rounded-2xl border-2 border-gfg/50 bg-gfg-tint px-6 py-4">
          <Sparkle className="absolute right-4 top-3 h-6 w-6" />
          <div className="grid grid-cols-3 gap-2 text-center sm:text-left">
            <div>
              <p className="text-xs font-bold text-ink/60 uppercase">Date</p>
              <p className="text-sm font-extrabold text-ink">{EVENT.date}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-ink/60 uppercase">Time</p>
              <p className="text-sm font-extrabold text-ink">{EVENT.time}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-ink/60 uppercase">Venue</p>
              <p className="text-sm font-extrabold text-ink">{EVENT.venue}</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
