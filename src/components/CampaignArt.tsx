/**
 * Category-based product silhouettes for Campaign Factory channels.
 * Each campaign defines a category — outdoor, editorial, b2b — and we
 * render different products per channel to give the campaign a complete
 * "world" across formats.
 *
 * All silhouettes accept color + optional color2 and scale to any size.
 */

type ArtProps = {
  color: string;
  color2?: string;
  className?: string;
};

export type CampaignCategory = "outdoor" | "editorial" | "b2b";

/* ────────────────────────────────────────────────────────────────────── */
/* Outdoor — REI / Patagonia / trail performance                          */
/* ────────────────────────────────────────────────────────────────────── */

export function OutBackpack({ color, color2, className }: ArtProps) {
  return (
    <svg viewBox="0 0 120 140" className={className} aria-hidden>
      {/* Straps */}
      <path
        d="M44 12 Q44 6 50 6 Q56 6 56 12 L56 30"
        fill="none"
        stroke={color2 ?? color}
        strokeWidth="2.2"
        opacity="0.8"
      />
      <path
        d="M64 12 Q64 6 70 6 Q76 6 76 12 L76 30"
        fill="none"
        stroke={color2 ?? color}
        strokeWidth="2.2"
        opacity="0.8"
      />
      {/* Pack body */}
      <path
        d="M30 28 Q30 22 36 22 L84 22 Q90 22 90 28 L92 110 Q92 122 80 122 L40 122 Q28 122 28 110 Z"
        fill={color}
        opacity="0.9"
      />
      {/* Top flap */}
      <path
        d="M34 28 Q34 18 44 18 L76 18 Q86 18 86 28 L86 44 Q86 50 80 50 L40 50 Q34 50 34 44 Z"
        fill={color2 ?? color}
        opacity="0.85"
      />
      {/* Front pocket */}
      <rect
        x="44"
        y="70"
        width="32"
        height="34"
        rx="3"
        fill={color2 ?? color}
        opacity="0.7"
      />
      {/* Clip */}
      <rect x="56" y="44" width="8" height="3" rx="1" fill={color2 ?? color} opacity="0.95" />
      {/* Buckle */}
      <rect x="56" y="84" width="8" height="3" fill={color} opacity="0.95" />
    </svg>
  );
}

export function OutBottle({ color, color2, className }: ArtProps) {
  return (
    <svg viewBox="0 0 80 140" className={className} aria-hidden>
      {/* Cap */}
      <rect x="32" y="6" width="16" height="14" rx="2" fill={color2 ?? color} opacity="0.95" />
      {/* Neck */}
      <rect x="34" y="20" width="12" height="8" fill={color} opacity="0.85" />
      {/* Body */}
      <path
        d="M22 28 Q22 26 26 26 L54 26 Q58 26 58 28 L58 124 Q58 132 50 132 L30 132 Q22 132 22 124 Z"
        fill={color}
        opacity="0.9"
      />
      {/* Label */}
      <rect x="22" y="56" width="36" height="28" fill={color2 ?? color} opacity="0.7" />
      {/* Label text bars */}
      <rect x="28" y="64" width="20" height="2" fill={color} opacity="0.5" />
      <rect x="28" y="70" width="14" height="2" fill={color} opacity="0.4" />
      <rect x="28" y="76" width="22" height="2" fill={color} opacity="0.5" />
      {/* Highlight */}
      <rect x="26" y="34" width="3" height="80" fill={color2 ?? color} opacity="0.5" />
    </svg>
  );
}

export function OutTent({ color, color2, className }: ArtProps) {
  return (
    <svg viewBox="0 0 160 120" className={className} aria-hidden>
      {/* Stars */}
      <circle cx="20" cy="20" r="1" fill={color2 ?? color} opacity="0.85" />
      <circle cx="140" cy="14" r="1.2" fill={color2 ?? color} opacity="0.9" />
      <circle cx="100" cy="28" r="0.8" fill={color2 ?? color} opacity="0.7" />
      <circle cx="40" cy="34" r="0.8" fill={color2 ?? color} opacity="0.6" />
      {/* Ground */}
      <rect x="0" y="100" width="160" height="20" fill={color2 ?? color} opacity="0.3" />
      {/* Tent left panel */}
      <path d="M80 50 L40 100 L80 100 Z" fill={color} opacity="0.95" />
      {/* Tent right panel */}
      <path d="M80 50 L120 100 L80 100 Z" fill={color} opacity="0.75" />
      {/* Entry */}
      <path d="M80 58 L72 100 L80 100 Z" fill={color2 ?? color} opacity="0.6" />
      {/* Pole reflection */}
      <line x1="80" y1="50" x2="80" y2="100" stroke={color2 ?? color} strokeWidth="0.8" opacity="0.65" />
    </svg>
  );
}

export function OutBoot({ color, color2, className }: ArtProps) {
  return (
    <svg viewBox="0 0 140 90" className={className} aria-hidden>
      {/* Sole */}
      <path
        d="M14 70 L122 70 Q128 70 128 76 L128 80 L8 80 L8 76 Q8 70 14 70 Z"
        fill={color2 ?? color}
        opacity="0.95"
      />
      {/* Boot body */}
      <path
        d="M22 26 Q22 22 26 22 L48 22 Q52 22 52 26 L52 50 L116 50 Q124 50 124 58 L124 70 L14 70 L14 32 Q14 28 18 28 Z"
        fill={color}
        opacity="0.9"
      />
      {/* Laces */}
      <line x1="26" y1="34" x2="48" y2="34" stroke={color2 ?? color} strokeWidth="1.4" opacity="0.85" />
      <line x1="26" y1="40" x2="48" y2="40" stroke={color2 ?? color} strokeWidth="1.4" opacity="0.85" />
      <line x1="26" y1="46" x2="48" y2="46" stroke={color2 ?? color} strokeWidth="1.4" opacity="0.85" />
      {/* Toe cap */}
      <path d="M104 50 Q116 50 124 58 L124 64 L100 64 Z" fill={color2 ?? color} opacity="0.75" />
      {/* Tread */}
      {[14, 28, 42, 56, 70, 84, 98, 112].map((x) => (
        <rect key={x} x={x} y="73" width="6" height="4" fill={color} opacity="0.6" />
      ))}
    </svg>
  );
}

export function OutCompass({ color, color2, className }: ArtProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      {/* Outer ring */}
      <circle cx="60" cy="60" r="52" fill={color2 ?? color} opacity="0.85" />
      <circle cx="60" cy="60" r="48" fill={color} opacity="0.95" />
      {/* Tick marks */}
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        const x1 = 60 + Math.cos(a) * 42;
        const y1 = 60 + Math.sin(a) * 42;
        const x2 = 60 + Math.cos(a) * (i % 4 === 0 ? 36 : 39);
        const y2 = 60 + Math.sin(a) * (i % 4 === 0 ? 36 : 39);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color2 ?? color}
            strokeWidth={i % 4 === 0 ? 1.2 : 0.6}
            opacity="0.8"
          />
        );
      })}
      {/* Needle */}
      <path d="M60 28 L52 60 L60 56 L68 60 Z" fill={color2 ?? color} opacity="0.95" />
      <path d="M60 92 L52 60 L60 64 L68 60 Z" fill={color} opacity="0.55" />
      {/* Center dot */}
      <circle cx="60" cy="60" r="3" fill={color2 ?? color} />
    </svg>
  );
}

export function OutJacket({ color, color2, className }: ArtProps) {
  return (
    <svg viewBox="0 0 140 140" className={className} aria-hidden>
      {/* Hood */}
      <path
        d="M48 16 Q70 4 92 16 Q92 32 70 36 Q48 32 48 16 Z"
        fill={color2 ?? color}
        opacity="0.85"
      />
      {/* Body */}
      <path
        d="M30 36 L48 30 Q56 28 70 28 Q84 28 92 30 L110 36 L120 88 L104 96 L104 124 Q104 130 98 130 L42 130 Q36 130 36 124 L36 96 L20 88 Z"
        fill={color}
        opacity="0.92"
      />
      {/* Zipper */}
      <line x1="70" y1="36" x2="70" y2="124" stroke={color2 ?? color} strokeWidth="1.4" opacity="0.95" />
      {/* Pocket lines */}
      <line x1="48" y1="86" x2="64" y2="86" stroke={color2 ?? color} strokeWidth="1" opacity="0.7" />
      <line x1="76" y1="86" x2="92" y2="86" stroke={color2 ?? color} strokeWidth="1" opacity="0.7" />
      {/* Shoulder seams */}
      <path d="M46 32 L36 96" fill="none" stroke={color2 ?? color} strokeWidth="0.8" opacity="0.55" />
      <path d="M94 32 L104 96" fill="none" stroke={color2 ?? color} strokeWidth="0.8" opacity="0.55" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/* Editorial — magazine / publisher / books                               */
/* ────────────────────────────────────────────────────────────────────── */

export function EdMagazine({ color, color2, className }: ArtProps) {
  return (
    <svg viewBox="0 0 110 140" className={className} aria-hidden>
      <rect x="8" y="8" width="94" height="124" fill={color} opacity="0.95" />
      {/* Masthead */}
      <rect x="16" y="16" width="78" height="14" fill={color2 ?? color} opacity="0.85" />
      <rect x="20" y="20" width="40" height="3" fill={color} opacity="0.6" />
      {/* Hero image area */}
      <rect x="16" y="36" width="78" height="60" fill={color2 ?? color} opacity="0.55" />
      {/* Faux figure */}
      <circle cx="55" cy="62" r="12" fill={color} opacity="0.4" />
      <path d="M40 90 Q55 76 70 90 Q70 96 40 96 Z" fill={color} opacity="0.5" />
      {/* Headlines */}
      <rect x="16" y="102" width="78" height="4" fill={color2 ?? color} opacity="0.7" />
      <rect x="16" y="110" width="56" height="3" fill={color2 ?? color} opacity="0.5" />
      <rect x="16" y="118" width="68" height="3" fill={color2 ?? color} opacity="0.5" />
      <rect x="16" y="124" width="40" height="3" fill={color2 ?? color} opacity="0.4" />
    </svg>
  );
}

export function EdBook({ color, color2, className }: ArtProps) {
  return (
    <svg viewBox="0 0 140 110" className={className} aria-hidden>
      {/* Closed book stack */}
      <rect x="18" y="80" width="104" height="18" fill={color2 ?? color} opacity="0.75" />
      <rect x="22" y="62" width="100" height="18" fill={color} opacity="0.85" />
      {/* Title bar */}
      <rect x="32" y="68" width="60" height="3" fill={color2 ?? color} opacity="0.6" />
      <rect x="32" y="74" width="40" height="2" fill={color2 ?? color} opacity="0.45" />
      {/* Open book on top */}
      <path
        d="M22 18 L70 12 L70 60 L22 60 Z"
        fill={color}
        opacity="0.95"
      />
      <path
        d="M70 12 L118 18 L118 60 L70 60 Z"
        fill={color2 ?? color}
        opacity="0.85"
      />
      {/* Page lines */}
      {[24, 30, 36, 42, 48].map((y) => (
        <g key={y}>
          <line x1="30" y1={y} x2="62" y2={y - 1} stroke={color2 ?? color} strokeWidth="0.6" opacity="0.65" />
          <line x1="78" y1={y - 1} x2="110" y2={y} stroke={color} strokeWidth="0.6" opacity="0.55" />
        </g>
      ))}
      {/* Spine */}
      <line x1="70" y1="12" x2="70" y2="60" stroke={color} strokeWidth="0.8" opacity="0.7" />
    </svg>
  );
}

export function EdQuote({ color, color2, className }: ArtProps) {
  return (
    <svg viewBox="0 0 140 110" className={className} aria-hidden>
      {/* Big quotation mark */}
      <text
        x="20"
        y="80"
        fontFamily="serif"
        fontSize="100"
        fontStyle="italic"
        fontWeight="700"
        fill={color}
        opacity="0.9"
      >
        “
      </text>
      <text
        x="86"
        y="80"
        fontFamily="serif"
        fontSize="100"
        fontStyle="italic"
        fontWeight="700"
        fill={color2 ?? color}
        opacity="0.65"
      >
        ”
      </text>
    </svg>
  );
}

export function EdCup({ color, color2, className }: ArtProps) {
  return (
    <svg viewBox="0 0 140 110" className={className} aria-hidden>
      {/* Steam */}
      <path
        d="M52 18 Q56 12 60 18 Q64 24 60 30"
        fill="none"
        stroke={color2 ?? color}
        strokeWidth="1.4"
        opacity="0.55"
        strokeLinecap="round"
      />
      <path
        d="M68 14 Q72 8 76 14 Q80 20 76 26"
        fill="none"
        stroke={color2 ?? color}
        strokeWidth="1.4"
        opacity="0.55"
        strokeLinecap="round"
      />
      <path
        d="M84 18 Q88 12 92 18 Q96 24 92 30"
        fill="none"
        stroke={color2 ?? color}
        strokeWidth="1.4"
        opacity="0.55"
        strokeLinecap="round"
      />
      {/* Cup */}
      <path
        d="M38 40 L106 40 L100 92 Q98 100 88 100 L56 100 Q46 100 44 92 Z"
        fill={color}
        opacity="0.9"
      />
      {/* Handle */}
      <path
        d="M106 50 Q124 52 124 70 Q124 86 106 84"
        fill="none"
        stroke={color}
        strokeWidth="6"
        opacity="0.85"
      />
      {/* Coffee surface */}
      <ellipse cx="72" cy="42" rx="32" ry="4" fill={color2 ?? color} opacity="0.85" />
      {/* Saucer */}
      <ellipse cx="72" cy="102" rx="44" ry="5" fill={color2 ?? color} opacity="0.65" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/* B2B — SaaS / data / observability                                      */
/* ────────────────────────────────────────────────────────────────────── */

export function B2BDashboard({ color, color2, className }: ArtProps) {
  return (
    <svg viewBox="0 0 160 110" className={className} aria-hidden>
      {/* Outer frame */}
      <rect x="8" y="8" width="144" height="94" rx="4" fill={color2 ?? color} opacity="0.25" />
      <rect x="10" y="10" width="140" height="14" fill={color} opacity="0.6" />
      <circle cx="16" cy="17" r="1.5" fill={color2 ?? color} opacity="0.9" />
      <circle cx="22" cy="17" r="1.5" fill={color2 ?? color} opacity="0.7" />
      <circle cx="28" cy="17" r="1.5" fill={color2 ?? color} opacity="0.5" />
      {/* Side rail */}
      <rect x="10" y="24" width="30" height="78" fill={color} opacity="0.3" />
      {[32, 42, 52, 62, 72, 82].map((y) => (
        <rect key={y} x="14" y={y} width="22" height="3" fill={color2 ?? color} opacity={y === 52 ? 0.95 : 0.5} />
      ))}
      {/* Main panel */}
      <rect x="44" y="28" width="56" height="32" fill={color} opacity="0.4" />
      {/* Bar chart */}
      <rect x="48" y="46" width="4" height="10" fill={color2 ?? color} opacity="0.85" />
      <rect x="56" y="42" width="4" height="14" fill={color2 ?? color} opacity="0.85" />
      <rect x="64" y="38" width="4" height="18" fill={color2 ?? color} opacity="0.95" />
      <rect x="72" y="44" width="4" height="12" fill={color2 ?? color} opacity="0.7" />
      <rect x="80" y="36" width="4" height="20" fill={color2 ?? color} opacity="0.95" />
      <rect x="88" y="40" width="4" height="16" fill={color2 ?? color} opacity="0.85" />
      {/* Stat card */}
      <rect x="104" y="28" width="42" height="32" fill={color} opacity="0.4" />
      <rect x="108" y="34" width="20" height="3" fill={color2 ?? color} opacity="0.65" />
      <rect x="108" y="40" width="32" height="6" fill={color2 ?? color} opacity="0.95" />
      <rect x="108" y="50" width="14" height="3" fill={color2 ?? color} opacity="0.6" />
      {/* Bottom panel */}
      <rect x="44" y="64" width="102" height="34" fill={color} opacity="0.4" />
      {/* Line chart in bottom */}
      <polyline
        points="50,90 60,82 70,86 80,76 90,80 100,72 110,76 120,68 130,72 140,64"
        fill="none"
        stroke={color2 ?? color}
        strokeWidth="1.4"
        opacity="0.95"
      />
    </svg>
  );
}

export function B2BChart({ color, color2, className }: ArtProps) {
  return (
    <svg viewBox="0 0 140 110" className={className} aria-hidden>
      {/* Axes */}
      <line x1="20" y1="20" x2="20" y2="90" stroke={color2 ?? color} strokeWidth="0.8" opacity="0.55" />
      <line x1="20" y1="90" x2="130" y2="90" stroke={color2 ?? color} strokeWidth="0.8" opacity="0.55" />
      {/* Gridlines */}
      {[40, 60, 80].map((y) => (
        <line key={y} x1="20" y1={y} x2="130" y2={y} stroke={color2 ?? color} strokeWidth="0.4" opacity="0.25" />
      ))}
      {/* Area fill */}
      <path
        d="M24 80 L40 72 L56 64 L72 70 L88 56 L104 48 L120 38 L130 32 L130 90 L24 90 Z"
        fill={color}
        opacity="0.35"
      />
      {/* Line */}
      <polyline
        points="24,80 40,72 56,64 72,70 88,56 104,48 120,38 130,32"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        opacity="0.95"
      />
      {/* Dots */}
      {[
        [24, 80],
        [40, 72],
        [56, 64],
        [72, 70],
        [88, 56],
        [104, 48],
        [120, 38],
        [130, 32],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.6" fill={color2 ?? color} opacity="0.95" />
      ))}
      {/* Annotation */}
      <rect x="92" y="14" width="38" height="14" rx="2" fill={color2 ?? color} opacity="0.85" />
      <rect x="96" y="19" width="22" height="2" fill={color} opacity="0.85" />
      <rect x="96" y="23" width="14" height="2" fill={color} opacity="0.6" />
    </svg>
  );
}

export function B2BCode({ color, color2, className }: ArtProps) {
  return (
    <svg viewBox="0 0 160 110" className={className} aria-hidden>
      <rect x="8" y="8" width="144" height="94" rx="4" fill={color} opacity="0.18" />
      <rect x="10" y="10" width="140" height="10" fill={color} opacity="0.5" />
      {/* Line numbers + code lines */}
      {[
        { y: 28, lens: [18, 30, 22] },
        { y: 36, lens: [12, 40] },
        { y: 44, lens: [24, 16, 28, 14] },
        { y: 52, lens: [20, 32] },
        { y: 60, lens: [14, 24, 18] },
        { y: 68, lens: [28, 36] },
        { y: 76, lens: [16, 22, 30] },
        { y: 84, lens: [12, 38] },
        { y: 92, lens: [22, 18, 24] },
      ].map((row, ri) => {
        let x = 22;
        return (
          <g key={ri}>
            {/* line number */}
            <text
              x="14"
              y={row.y + 2}
              fontFamily="monospace"
              fontSize="5"
              fill={color2 ?? color}
              opacity="0.4"
            >
              {ri + 1}
            </text>
            {row.lens.map((w, ci) => {
              const rect = (
                <rect
                  key={ci}
                  x={x}
                  y={row.y - 2}
                  width={w}
                  height="3"
                  rx="0.6"
                  fill={ci === 0 ? color2 ?? color : color}
                  opacity={ci === 0 ? 0.95 : 0.65}
                />
              );
              x += w + 3;
              return rect;
            })}
          </g>
        );
      })}
    </svg>
  );
}

export function B2BAlert({ color, color2, className }: ArtProps) {
  return (
    <svg viewBox="0 0 140 140" className={className} aria-hidden>
      {/* Outer ping rings */}
      <circle cx="70" cy="70" r="58" fill="none" stroke={color2 ?? color} strokeWidth="0.6" opacity="0.25" />
      <circle cx="70" cy="70" r="44" fill="none" stroke={color2 ?? color} strokeWidth="0.8" opacity="0.4" />
      <circle cx="70" cy="70" r="32" fill={color2 ?? color} opacity="0.18" />
      {/* Status pill */}
      <rect x="38" y="58" width="64" height="24" rx="12" fill={color} opacity="0.95" />
      <circle cx="50" cy="70" r="4" fill={color2 ?? color} />
      <rect x="60" y="68" width="36" height="4" fill={color2 ?? color} opacity="0.95" />
      {/* Mini metrics below */}
      <rect x="42" y="92" width="22" height="14" rx="2" fill={color} opacity="0.35" />
      <rect x="46" y="98" width="14" height="3" fill={color2 ?? color} opacity="0.85" />
      <rect x="68" y="92" width="22" height="14" rx="2" fill={color} opacity="0.35" />
      <rect x="72" y="98" width="14" height="3" fill={color2 ?? color} opacity="0.85" />
      <rect x="94" y="92" width="22" height="14" rx="2" fill={color} opacity="0.35" />
      <rect x="98" y="98" width="14" height="3" fill={color2 ?? color} opacity="0.85" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/* Pickers — return the right silhouette for a campaign + channel slot    */
/* ────────────────────────────────────────────────────────────────────── */

type Slot = "hero" | "portrait" | "story" | "feed" | "print" | "banner";

export function CampaignProduct({
  category,
  slot,
  color,
  color2,
  className,
}: {
  category: CampaignCategory;
  slot: Slot;
  color: string;
  color2?: string;
  className?: string;
}) {
  const props = { color, color2, className };
  if (category === "outdoor") {
    switch (slot) {
      case "hero":
        return <OutBackpack {...props} />;
      case "portrait":
        return <OutBoot {...props} />;
      case "story":
        return <OutTent {...props} />;
      case "feed":
        return <OutBottle {...props} />;
      case "print":
        return <OutCompass {...props} />;
      case "banner":
        return <OutJacket {...props} />;
    }
  }
  if (category === "editorial") {
    switch (slot) {
      case "hero":
        return <EdMagazine {...props} />;
      case "portrait":
        return <EdBook {...props} />;
      case "story":
        return <EdQuote {...props} />;
      case "feed":
        return <EdCup {...props} />;
      case "print":
        return <EdBook {...props} />;
      case "banner":
        return <EdMagazine {...props} />;
    }
  }
  // b2b
  switch (slot) {
    case "hero":
      return <B2BDashboard {...props} />;
    case "portrait":
      return <B2BChart {...props} />;
    case "story":
      return <B2BAlert {...props} />;
    case "feed":
      return <B2BCode {...props} />;
    case "print":
      return <B2BChart {...props} />;
    case "banner":
      return <B2BDashboard {...props} />;
  }
}
