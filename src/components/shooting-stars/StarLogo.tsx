/**
 * The Shooting Stars — identity system.
 *
 * The mark is a four-point sparkle with a tapered comet trail: readable at
 * 16px as a favicon, and strong enough at poster scale to carry a t-shirt.
 * Three lockups are built on it:
 *
 *   StarMark      the symbol alone
 *   LogoLockup    horizontal symbol + wordmark (nav, footer)
 *   BandBadge     circular seal with curved type (poster / merch moments)
 *
 * The comet gradient (violet → ember → gold) is the band's signature and is
 * reused across the site on rules, accent words, and hover states. It is
 * declared once by <StarLogoDefs /> in the band layout and referenced by id
 * from every mark, so ids stay stable between server and client render.
 */

export const COMET_STOPS = ["#7c5cff", "#ff5a3c", "#ffc94a"] as const;

/**
 * Renders the shared gradient defs. Mount exactly once, near the top of the
 * band subtree — `url(#…)` references resolve document-wide, so every mark on
 * the page can point at these without redeclaring them.
 */
export function StarLogoDefs() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      className="absolute"
      style={{ position: "absolute" }}
    >
      <defs>
        <linearGradient id="ss-comet" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor={COMET_STOPS[0]} />
          <stop offset="48%" stopColor={COMET_STOPS[1]} />
          <stop offset="100%" stopColor={COMET_STOPS[2]} />
        </linearGradient>
        <linearGradient id="ss-comet-h" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={COMET_STOPS[0]} />
          <stop offset="50%" stopColor={COMET_STOPS[1]} />
          <stop offset="100%" stopColor={COMET_STOPS[2]} />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** The mark's geometry, on a 64×64 grid. Shared by StarMark and BandBadge. */
function MarkShapes({ monochrome }: { monochrome: boolean }) {
  const fill = monochrome ? "currentColor" : "url(#ss-comet)";
  return (
    <>
      <g fill={fill}>
        {/* Comet trail — three tapered slivers falling to the lower left,
            longest to shortest, so the mark reads as motion, not ornament. */}
        <path d="M3.5 60.5 Q19 50.5 31.5 35.5 L36 40 Q22.5 53 3.5 60.5 Z" />
        <path d="M6 44 Q14 39 21 31.5 L23.5 34 Q16.5 41.5 6 44 Z" opacity="0.7" />
        <path d="M22 57 Q29 52.5 35 45.5 L37.5 48 Q31 54.5 22 57 Z" opacity="0.45" />
        {/* Four-point sparkle, centred on (41, 19). */}
        <path d="M41 2 C41 13.5 46.5 19 58 19 C46.5 19 41 24.5 41 36 C41 24.5 35.5 19 24 19 C35.5 19 41 13.5 41 2 Z" />
      </g>
      {/* Satellite sparks — the "stars" plural, and they keep the upper-right
          corner from going empty at poster scale. */}
      <g fill={monochrome ? "currentColor" : COMET_STOPS[2]} opacity="0.9">
        <path d="M56 34 C56 38 57.6 39.6 61.5 39.6 C57.6 39.6 56 41.2 56 45 C56 41.2 54.4 39.6 50.5 39.6 C54.4 39.6 56 38 56 34 Z" />
        <path d="M19 5 C19 8 20.2 9.2 23 9.2 C20.2 9.2 19 10.4 19 13.3 C19 10.4 17.8 9.2 15 9.2 C17.8 9.2 19 8 19 5 Z" />
      </g>
    </>
  );
}

export function StarMark({
  className,
  monochrome = false,
}: {
  className?: string;
  /** Render in currentColor instead of the comet gradient. */
  monochrome?: boolean;
}) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <MarkShapes monochrome={monochrome} />
    </svg>
  );
}

/**
 * Horizontal lockup: mark + two-line wordmark. Used in the nav and footer.
 * Sizing is passed in rather than baked so the same lockup can run at 32px
 * and at 80px without a second component.
 */
export function LogoLockup({
  className,
  markClassName = "h-9 w-9",
  textClassName = "text-[1.05rem] md:text-[1.2rem]",
}: {
  className?: string;
  markClassName?: string;
  textClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <StarMark className={`${markClassName} shrink-0`} />
      <span className="flex flex-col leading-none">
        <span className="ss-display text-[0.5rem] tracking-[0.42em] text-ss-smoke">
          The
        </span>
        <span
          className={`ss-display tracking-[0.02em] text-ss-cream ${textClassName}`}
        >
          Shooting Stars
        </span>
      </span>
    </span>
  );
}

/**
 * Circular seal for poster and merch moments. Curved type rides an invisible
 * arc; the ring, dashed inner rule, and centred mark make it read as a stamp
 * rather than a logo squeezed into a circle. Decorative — the accessible name
 * comes from whatever labels it in context.
 */
export function BandBadge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <defs>
        {/* Starts at 12 o'clock and runs clockwise so the text reads from the
            top. Split into two arcs because a single 360° arc is degenerate. */}
        <path
          id="ss-badge-arc"
          d="M100 22 A78 78 0 1 1 99.9 22"
          fill="none"
        />
      </defs>

      <circle cx="100" cy="100" r="98" fill="none" stroke="#322d4d" strokeWidth="1" />
      <circle
        cx="100"
        cy="100"
        r="88"
        fill="none"
        stroke="url(#ss-comet)"
        strokeWidth="1.5"
      />
      <circle
        cx="100"
        cy="100"
        r="62"
        fill="none"
        stroke="#322d4d"
        strokeWidth="1"
        strokeDasharray="2 5"
      />

      <text
        fill="#f6f2e9"
        style={{
          fontFamily: "var(--font-band), sans-serif",
          fontSize: "13px",
          letterSpacing: "3.1px",
        }}
      >
        <textPath href="#ss-badge-arc" startOffset="0%">
          THE SHOOTING STARS ★ VIRGINIA BEACH ★ EST. 2024 ★
        </textPath>
      </text>

      {/* Nested SVG re-frames the 64-unit mark into the badge's centre. */}
      <svg x="64" y="64" width="72" height="72" viewBox="0 0 64 64">
        <MarkShapes monochrome={false} />
      </svg>
    </svg>
  );
}
