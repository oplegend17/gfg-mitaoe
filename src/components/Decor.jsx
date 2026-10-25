// Corner triangles and dot grid, echoing the orientation poster.
export function CornerTriangles({ className = "", flip = false }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 160 160"
      className={className}
      style={flip ? { transform: "rotate(180deg)" } : undefined}
    >
      <polygon points="0,0 80,0 0,80" fill="none" stroke="#2f8d46" strokeWidth="2" />
      <polygon points="0,0 40,0 0,40" fill="#c9daf4" />
      <polygon points="80,0 160,0 80,80" fill="#f5c842" />
      <polygon points="0,80 40,40 40,120" fill="none" stroke="#2f8d46" strokeWidth="2" />
      <polygon points="40,40 80,0 80,80" fill="none" stroke="#2f8d46" strokeWidth="2" />
      <polygon points="0,80 0,160 40,120" fill="#2f8d46" opacity="0.9" />
    </svg>
  );
}

export function DotGrid({ className = "" }) {
  const dots = [];
  for (let r = 0; r < 5; r += 1) {
    for (let c = 0; c < 8; c += 1) {
      dots.push(<circle key={`${r}-${c}`} cx={c * 14 + 4} cy={r * 14 + 4} r="2" fill="#2f8d46" />);
    }
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 112 70" className={className}>
      {dots}
    </svg>
  );
}

export function Sparkle({ className = "" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 40 40" className={className}>
      <path
        d="M20 3 C21 14 26 19 37 20 C26 21 21 26 20 37 C19 26 14 21 3 20 C14 19 19 14 20 3Z"
        fill="none"
        stroke="#f5c842"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
