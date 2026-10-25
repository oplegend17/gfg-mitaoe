import { useState } from "react";
import { EVENT } from "../config/firebase.js";

// Put the official chapter logo at /public/logo.png. If it is missing,
// the text lockup below still reads correctly.
export default function Brand({ size = "md" }) {
  const [hasLogo, setHasLogo] = useState(true);
  const logoH = size === "lg" ? "h-20" : "h-14";

  return (
    <div className="flex items-center gap-3.5">
      {hasLogo && (
        <img
          src="/Orientation Session.png"
          alt="GeeksforGeeks"
          className={`${logoH} w-auto object-contain`}
          onError={() => setHasLogo(false)}
        />
      )}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <span className={`font-extrabold tracking-wider text-ink ${size === "lg" ? "text-2xl" : "text-lg"}`}>
            CAMPUS BODY
          </span>
        </div>
        <p className={`font-bold text-gfg-deep ${size === "lg" ? "text-sm" : "text-xs"}`}>
          {EVENT.college}
        </p>
      </div>
    </div>
  );
}
