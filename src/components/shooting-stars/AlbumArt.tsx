import type { Release } from "@/lib/shootingStars";

/**
 * Procedural record sleeves.
 *
 * The band has no photography, so each release gets a drawn cover instead of
 * a stock image — four distinct compositions sharing one palette and one
 * type treatment, which reads as a deliberate catalog rather than a gap.
 *
 * Ids are namespaced per artwork key. Two instances of the same sleeve would
 * duplicate an id, which browsers resolve to the first (identical) definition
 * — harmless, and the alternative is a hydration-unsafe id counter.
 */

type Props = {
  art: Release["art"];
  title: string;
  className?: string;
  /**
   * Drop the sleeve's band name and title. At thumbnail size (the hero's
   * 56px capsule) that type is smaller than a pixel row and reads as noise.
   */
  compact?: boolean;
};

const NIGHT = "#08070f";
const CREAM = "#f6f2e9";
const GOLD = "#ffc94a";
const EMBER = "#ff5a3c";
const VIOLET = "#7c5cff";

export default function AlbumArt({ art, title, className, compact }: Props) {
  // Anton runs ~0.42em per character. Step the title down so a long release
  // name still clears the 344-unit type area instead of running off the sleeve.
  const titleSize = title.length > 19 ? 26 : title.length > 13 ? 30 : 34;

  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      role="img"
      aria-label={`Cover artwork for ${title}`}
    >
      {art === "comet" && <Comet />}
      {art === "eclipse" && <Eclipse />}
      {art === "orbit" && <Orbit />}
      {art === "signal" && <Signal />}

      {/* Shared sleeve furniture: catalog rule + title, bottom left. */}
      {!compact && (
        <g>
          <line
            x1="28"
            y1="336"
            x2="372"
            y2="336"
            stroke={CREAM}
            strokeOpacity="0.25"
            strokeWidth="1"
          />
          <text
            x="28"
            y="326"
            fill={CREAM}
            fillOpacity="0.62"
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: "11px",
              letterSpacing: "2.4px",
            }}
          >
            THE SHOOTING STARS
          </text>
          <text
            x="28"
            y="372"
            fill={CREAM}
            style={{
              fontFamily: "var(--font-band), sans-serif",
              fontSize: `${titleSize}px`,
              letterSpacing: "-0.4px",
            }}
          >
            {title.toUpperCase()}
          </text>
        </g>
      )}
    </svg>
  );
}

/** Speckled star dust, used by several sleeves. Deterministic by construction. */
function Dust({ seed = 0, count = 46 }: { seed?: number; count?: number }) {
  const dots = [];
  for (let i = 0; i < count; i++) {
    // Cheap deterministic hash — no Math.random(), so server and client agree.
    const a = Math.sin((i + 1) * (12.9898 + seed)) * 43758.5453;
    const b = Math.sin((i + 1) * (78.233 + seed)) * 12345.6789;
    const x = (a - Math.floor(a)) * 400;
    const y = (b - Math.floor(b)) * 300;
    const r = ((a - Math.floor(a)) * 1.4 + 0.3) * 0.9;
    dots.push(
      <circle
        key={i}
        cx={x.toFixed(1)}
        cy={y.toFixed(1)}
        r={r.toFixed(2)}
        fill={CREAM}
        opacity={(0.25 + (b - Math.floor(b)) * 0.6).toFixed(2)}
      />
    );
  }
  return <g>{dots}</g>;
}

function Comet() {
  return (
    <>
      <defs>
        <radialGradient id="ssArtCometGlow" cx="72%" cy="26%" r="58%">
          <stop offset="0%" stopColor={VIOLET} stopOpacity="0.55" />
          <stop offset="100%" stopColor={VIOLET} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ssArtCometTrail" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor={VIOLET} stopOpacity="0" />
          <stop offset="55%" stopColor={EMBER} />
          <stop offset="100%" stopColor={GOLD} />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill={NIGHT} />
      <rect width="400" height="400" fill="url(#ssArtCometGlow)" />
      <Dust seed={0.3} />
      <circle cx="288" cy="104" r="86" fill="none" stroke={GOLD} strokeOpacity="0.3" strokeWidth="1" />
      <path
        d="M20 292 C110 268 214 196 300 96"
        fill="none"
        stroke="url(#ssArtCometTrail)"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M42 250 C104 232 168 190 216 140"
        fill="none"
        stroke={GOLD}
        strokeOpacity="0.35"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="300" cy="96" r="14" fill={GOLD} />
      <circle cx="300" cy="96" r="30" fill={GOLD} opacity="0.18" />
    </>
  );
}

function Eclipse() {
  return (
    <>
      <defs>
        <linearGradient id="ssArtEclipseSun" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={GOLD} />
          <stop offset="60%" stopColor={EMBER} />
          <stop offset="100%" stopColor={VIOLET} />
        </linearGradient>
        <clipPath id="ssArtEclipseClip">
          <circle cx="200" cy="168" r="112" />
        </clipPath>
      </defs>
      <rect width="400" height="400" fill={NIGHT} />
      <Dust seed={1.7} count={34} />
      <circle cx="200" cy="168" r="112" fill="url(#ssArtEclipseSun)" />
      {/* Horizontal slats carve the disc into a screen-printed sunrise. */}
      <g clipPath="url(#ssArtEclipseClip)">
        {Array.from({ length: 9 }, (_, i) => (
          <rect
            key={i}
            x="80"
            y={182 + i * 11}
            width="240"
            height={2 + i * 0.9}
            fill={NIGHT}
            opacity="0.85"
          />
        ))}
      </g>
      <circle cx="200" cy="168" r="112" fill="none" stroke={CREAM} strokeOpacity="0.3" />
      <circle cx="160" cy="128" r="132" fill={NIGHT} opacity="0.55" />
      <circle cx="160" cy="128" r="132" fill="none" stroke={CREAM} strokeOpacity="0.18" />
    </>
  );
}

function Orbit() {
  return (
    <>
      <defs>
        <linearGradient id="ssArtOrbitLimb" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#241d4d" />
          <stop offset="100%" stopColor="#0b0916" />
        </linearGradient>
        <linearGradient id="ssArtOrbitGlow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={EMBER} stopOpacity="0" />
          <stop offset="45%" stopColor={GOLD} stopOpacity="0.95" />
          <stop offset="100%" stopColor={EMBER} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill={NIGHT} />
      <Dust seed={4.1} count={30} />

      {/* Orbit path, behind everything. */}
      <ellipse
        cx="200"
        cy="176"
        rx="156"
        ry="64"
        fill="none"
        stroke={CREAM}
        strokeOpacity="0.26"
        strokeDasharray="4 7"
        transform="rotate(-11 200 176)"
      />

      {/* Downlink: arcs opening toward the surface, then a dotted line to the
          one lit town below. */}
      {[22, 38, 54].map((r, i) => (
        <path
          key={r}
          d={`M${292 - r} 146 A${r} ${r} 0 0 0 ${292 + r} 146`}
          fill="none"
          stroke={GOLD}
          strokeOpacity={0.55 - i * 0.14}
          strokeWidth="1.6"
        />
      ))}
      <line
        x1="292"
        y1="150"
        x2="248"
        y2="286"
        stroke={GOLD}
        strokeOpacity="0.4"
        strokeWidth="1"
        strokeDasharray="2 5"
      />

      {/* The satellite: body, solar wings, dish. */}
      <g transform="translate(292 124) rotate(-11)">
        <rect x="-9" y="-11" width="18" height="22" rx="2" fill={CREAM} />
        <rect x="-40" y="-6" width="27" height="12" fill={GOLD} />
        <rect x="13" y="-6" width="27" height="12" fill={GOLD} />
        <line x1="-13" y1="0" x2="-9" y2="0" stroke={CREAM} strokeWidth="2" />
        <line x1="9" y1="0" x2="13" y2="0" stroke={CREAM} strokeWidth="2" />
        <circle cx="0" cy="-19" r="7" fill="none" stroke={CREAM} strokeWidth="2" />
      </g>

      {/* Planet limb rising from the bottom edge. Kept dark so the sleeve
          title still reads over it, with a lit atmosphere along the edge. */}
      <circle cx="200" cy="622" r="330" fill="url(#ssArtOrbitLimb)" />
      <path
        d="M18 328 A330 330 0 0 1 382 328"
        fill="none"
        stroke="url(#ssArtOrbitGlow)"
        strokeWidth="2.5"
      />
      <circle cx="248" cy="292" r="2.6" fill={GOLD} />
      <circle cx="248" cy="292" r="9" fill={GOLD} opacity="0.22" />
    </>
  );
}

function Signal() {
  const bars = Array.from({ length: 34 }, (_, i) => {
    const a = Math.sin((i + 1) * 3.7) * 0.5 + 0.5;
    const b = Math.sin((i + 1) * 1.3) * 0.5 + 0.5;
    return Math.max(0.12, a * 0.6 + b * 0.5);
  });

  return (
    <>
      <rect width="400" height="400" fill={NIGHT} />
      <Dust seed={7.9} count={22} />
      {/* Broadcast arcs. */}
      {[54, 92, 130].map((r, i) => (
        <path
          key={r}
          d={`M${200 - r} 250 A${r} ${r} 0 0 1 ${200 + r} 250`}
          fill="none"
          stroke={i === 0 ? GOLD : CREAM}
          strokeOpacity={i === 0 ? 0.9 : 0.22 - i * 0.05}
          strokeWidth={i === 0 ? 2 : 1}
        />
      ))}
      {/* Level meter. */}
      <g>
        {bars.map((h, i) => {
          const x = 30 + i * 10.6;
          const height = h * 120;
          return (
            <rect
              key={i}
              x={x.toFixed(1)}
              y={(250 - height).toFixed(1)}
              width="5"
              height={height.toFixed(1)}
              fill={i % 7 === 0 ? EMBER : CREAM}
              opacity={i % 7 === 0 ? 0.95 : 0.5}
            />
          );
        })}
      </g>
      <circle cx="200" cy="250" r="7" fill={GOLD} />
      <line x1="28" y1="250" x2="372" y2="250" stroke={CREAM} strokeOpacity="0.4" />
    </>
  );
}
