type ArtProps = {
  color: string;
  /** Secondary tint for layered effects */
  color2?: string;
  className?: string;
};

/**
 * Reusable SVG artworks for use inside mock design surfaces. Each piece accepts
 * a primary brand color (and optional secondary) so it can re-skin per brand.
 * They're abstract enough to read as "imagery" without locking the demo to a
 * specific subject, but specific enough that the layouts feel real.
 */

export function ArtSun({ color, color2, className }: ArtProps) {
  return (
    <svg
      viewBox="0 0 200 120"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden
    >
      <defs>
        <radialGradient id="sunGrad" cx="50%" cy="100%" r="55%">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="60%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="200" height="120" fill="url(#sunGrad)" />
      <circle cx="100" cy="120" r="38" fill={color} opacity="0.85" />
      <circle cx="100" cy="120" r="62" fill="none" stroke={color} strokeWidth="0.7" opacity="0.6" />
      <circle cx="100" cy="120" r="88" fill="none" stroke={color} strokeWidth="0.5" opacity="0.35" />
      {color2 && (
        <path
          d="M0 100 L40 90 L80 95 L120 88 L160 92 L200 86 L200 120 L0 120 Z"
          fill={color2}
          opacity="0.7"
        />
      )}
    </svg>
  );
}

export function ArtPeaks({ color, color2, className }: ArtProps) {
  return (
    <svg
      viewBox="0 0 200 120"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="peakSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="100%" stopColor={color} stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <rect width="200" height="120" fill="url(#peakSky)" />
      <circle cx="48" cy="34" r="10" fill={color} opacity="0.55" />
      <path
        d="M0 120 L0 80 L35 50 L70 75 L100 55 L135 78 L170 60 L200 85 L200 120 Z"
        fill={color}
        opacity="0.75"
      />
      <path
        d="M0 120 L0 95 L25 85 L60 100 L95 88 L130 102 L165 92 L200 105 L200 120 Z"
        fill={color2 ?? color}
        opacity="0.6"
      />
    </svg>
  );
}

export function ArtCurve({ color, color2, className }: ArtProps) {
  return (
    <svg
      viewBox="0 0 200 120"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="curveGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.5" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <rect width="200" height="120" fill="url(#curveGrad)" />
      <path
        d="M0 60 C50 20, 100 100, 150 50 S 250 80, 200 60 L200 120 L0 120 Z"
        fill={color}
        opacity="0.7"
      />
      <path
        d="M0 80 C40 50, 80 110, 130 70 S 220 90, 200 80 L200 120 L0 120 Z"
        fill={color2 ?? color}
        opacity="0.55"
      />
      <path
        d="M0 60 C50 20, 100 100, 150 50 S 250 80, 200 60"
        fill="none"
        stroke={color}
        strokeWidth="0.8"
        opacity="0.85"
      />
    </svg>
  );
}

export function ArtGrid({ color, color2, className }: ArtProps) {
  return (
    <svg
      viewBox="0 0 200 120"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden
    >
      <defs>
        <pattern id="dotGrid" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill={color} opacity="0.5" />
        </pattern>
        <radialGradient id="gridFade" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="gridMask">
          <rect width="200" height="120" fill="url(#gridFade)" />
        </mask>
      </defs>
      <rect width="200" height="120" fill={color} opacity="0.05" />
      <rect width="200" height="120" fill="url(#dotGrid)" mask="url(#gridMask)" />
      <rect
        x="60"
        y="30"
        width="80"
        height="60"
        fill="none"
        stroke={color2 ?? color}
        strokeWidth="0.8"
        opacity="0.6"
      />
    </svg>
  );
}

export function ArtBurst({ color, color2, className }: ArtProps) {
  // Radial lines emanating from center-right
  const lines = Array.from({ length: 18 }, (_, i) => i);
  return (
    <svg
      viewBox="0 0 200 120"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden
    >
      <defs>
        <radialGradient id="burstFade" cx="65%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.6" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="200" height="120" fill="url(#burstFade)" />
      {lines.map((i) => {
        const angle = (i / lines.length) * Math.PI * 2;
        const cx = 130;
        const cy = 60;
        const r1 = 8;
        const r2 = 90;
        const x1 = cx + Math.cos(angle) * r1;
        const y1 = cy + Math.sin(angle) * r1;
        const x2 = cx + Math.cos(angle) * r2;
        const y2 = cy + Math.sin(angle) * r2;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color2 ?? color}
            strokeWidth="0.5"
            opacity={0.3 + (i % 3) * 0.15}
          />
        );
      })}
      <circle cx="130" cy="60" r="14" fill={color} opacity="0.85" />
    </svg>
  );
}

export function ArtProduct({ color, color2, className }: ArtProps) {
  // A vertical product/bottle silhouette — useful for packaging mocks
  return (
    <svg
      viewBox="0 0 120 200"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="prodGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color2 ?? color} stopOpacity="0.4" />
          <stop offset="50%" stopColor={color} stopOpacity="0.85" />
          <stop offset="100%" stopColor={color2 ?? color} stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <path
        d="M45 20 L75 20 L78 32 L82 45 L82 175 C82 182 76 188 70 188 L50 188 C44 188 38 182 38 175 L38 45 L42 32 Z"
        fill="url(#prodGrad)"
      />
      <rect x="44" y="80" width="32" height="48" fill={color} opacity="0.95" rx="2" />
      <rect x="49" y="95" width="22" height="2" fill={color2 ?? color} opacity="0.95" />
      <rect x="49" y="105" width="22" height="1" fill={color2 ?? color} opacity="0.75" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/* Gradient mesh — reusable per-brand background                           */
/* ────────────────────────────────────────────────────────────────────── */

type MeshProps = {
  bg: string;
  accent: string;
  accent2?: string;
  /** "warm" puts accent at top, "cool" puts it at bottom, "side" puts it on one side */
  variant?: "warm" | "cool" | "side" | "center";
  className?: string;
};

export function GradientMesh({
  bg,
  accent,
  accent2,
  variant = "warm",
  className,
}: MeshProps) {
  const second = accent2 ?? accent;
  let layers = "";
  switch (variant) {
    case "warm":
      layers = `
        radial-gradient(circle at 25% 20%, ${accent}66, transparent 55%),
        radial-gradient(circle at 75% 30%, ${second}40, transparent 60%),
        radial-gradient(circle at 50% 90%, ${accent}26, transparent 70%)
      `;
      break;
    case "cool":
      layers = `
        radial-gradient(circle at 70% 80%, ${accent}66, transparent 55%),
        radial-gradient(circle at 30% 60%, ${second}33, transparent 65%),
        radial-gradient(circle at 50% 10%, ${accent}1a, transparent 70%)
      `;
      break;
    case "side":
      layers = `
        radial-gradient(circle at 90% 50%, ${accent}80, transparent 60%),
        radial-gradient(circle at 10% 70%, ${second}26, transparent 65%)
      `;
      break;
    case "center":
      layers = `
        radial-gradient(circle at 50% 50%, ${accent}66, transparent 55%),
        radial-gradient(circle at 20% 20%, ${second}33, transparent 60%),
        radial-gradient(circle at 80% 80%, ${second}33, transparent 60%)
      `;
      break;
  }
  return (
    <div
      aria-hidden
      className={className}
      style={{
        background: `${layers}, ${bg}`,
        backgroundColor: bg,
      }}
    />
  );
}
