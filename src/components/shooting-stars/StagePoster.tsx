/**
 * The "band photo" stand-in.
 *
 * There are no press shots yet, so the About section runs a drawn gig poster
 * instead: stage beams raking down through haze, a halftone moon, and a crowd
 * silhouette along the bottom. Reads as art direction rather than as a
 * missing image, and it survives at any width.
 *
 * Decorative — labelled by the surrounding section, so it's aria-hidden.
 */

const CROWD = [
  // x, head radius — hand-placed so the skyline of heads has rhythm rather
  // than an even comb.
  [14, 11],
  [44, 9],
  [70, 13],
  [104, 10],
  [132, 8],
  [158, 12],
  [190, 10],
  [216, 9],
  [246, 13],
  [278, 10],
  [306, 8],
  [332, 12],
  [364, 10],
  [392, 9],
] as const;

export default function StagePoster({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 340" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="ssPosterBeam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffc94a" stopOpacity="0.5" />
          <stop offset="70%" stopColor="#ff5a3c" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#ff5a3c" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ssPosterBeam2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c5cff" stopOpacity="0.45" />
          <stop offset="75%" stopColor="#7c5cff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="ssPosterMoon" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#ffc94a" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ff5a3c" stopOpacity="0.75" />
        </radialGradient>
        <pattern
          id="ssPosterDots"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1.5" cy="1.5" r="1.15" fill="#08070f" fillOpacity="0.55" />
        </pattern>
        <linearGradient id="ssPosterFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#08070f" stopOpacity="0" />
          <stop offset="100%" stopColor="#08070f" />
        </linearGradient>
      </defs>

      <rect width="400" height="340" fill="#0b0916" />

      {/* Halftone moon behind the stage. */}
      <circle cx="286" cy="96" r="58" fill="url(#ssPosterMoon)" />
      <circle cx="286" cy="96" r="58" fill="url(#ssPosterDots)" />
      <circle
        cx="286"
        cy="96"
        r="72"
        fill="none"
        stroke="#f6f2e9"
        strokeOpacity="0.16"
      />

      {/* Star specks. */}
      {[
        [46, 40],
        [96, 22],
        [148, 58],
        [206, 32],
        [352, 44],
        [372, 118],
        [24, 96],
        [122, 104],
      ].map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i % 3 === 0 ? 1.8 : 1.1}
          fill="#f6f2e9"
          opacity={i % 3 === 0 ? 0.85 : 0.5}
        />
      ))}

      {/* Raking stage beams. */}
      <polygon points="96,-10 130,-10 232,300 40,300" fill="url(#ssPosterBeam)" />
      <polygon points="264,-10 292,-10 380,300 214,300" fill="url(#ssPosterBeam2)" />
      <polygon
        points="176,-10 196,-10 262,300 132,300"
        fill="url(#ssPosterBeam)"
        opacity="0.55"
      />

      {/* Backline, in silhouette against the beams: two amp stacks, a kick
          drum on a riser, and three mic stands. This is what turns an
          abstract light study into a stage. */}
      <g fill="#08070f" stroke="#08070f">
        {/* Riser */}
        <rect x="132" y="242" width="136" height="10" />
        {/* Kick drum + snare */}
        <circle cx="200" cy="222" r="21" />
        <rect x="188" y="228" width="24" height="16" />
        {/* Cymbal on a stand */}
        <line x1="232" y1="242" x2="232" y2="206" strokeWidth="2.5" />
        <ellipse cx="232" cy="204" rx="15" ry="2.6" />
        <line x1="168" y1="242" x2="168" y2="212" strokeWidth="2.5" />
        <ellipse cx="168" cy="210" rx="12" ry="2.2" />
        {/* Amp stacks */}
        <rect x="72" y="212" width="46" height="40" rx="2" />
        <rect x="78" y="196" width="34" height="18" rx="2" />
        <rect x="282" y="216" width="42" height="36" rx="2" />
        <rect x="288" y="202" width="30" height="16" rx="2" />
        {/* Mic stands — boom arms angled in toward the front of the stage */}
        {[
          [116, 252],
          [200, 252],
          [286, 252],
        ].map(([x, base]) => (
          <g key={x}>
            <line x1={x} y1={base} x2={x} y2={base - 58} strokeWidth="2.2" />
            <line
              x1={x}
              y1={base - 58}
              x2={x + 20}
              y2={base - 66}
              strokeWidth="2.2"
            />
            <circle cx={x + 23} cy={base - 67} r="4.4" />
          </g>
        ))}
      </g>

      {/* Crowd. Head + shoulder arc per person, all on one baseline. */}
      <g fill="#08070f">
        {CROWD.map(([x, r], i) => {
          const headY = 300 - r * 2.1;
          const shoulderW = r * 2.5;
          return (
            <g key={i}>
              <circle cx={x} cy={headY} r={r} />
              <path
                d={`M${x - shoulderW} 340 Q${x - shoulderW} ${headY + r * 1.1} ${x} ${headY + r * 1.05} Q${x + shoulderW} ${headY + r * 1.1} ${x + shoulderW} 340 Z`}
              />
            </g>
          );
        })}
        <rect x="0" y="304" width="400" height="36" />
      </g>
      <rect x="0" y="248" width="400" height="92" fill="url(#ssPosterFloor)" opacity="0.7" />

      {/* Frame. */}
      <rect
        x="0.5"
        y="0.5"
        width="399"
        height="339"
        fill="none"
        stroke="#221f36"
      />
    </svg>
  );
}
