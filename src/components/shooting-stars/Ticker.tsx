import { StarMark } from "./StarLogo";

/**
 * Infinite marquee strip. The item list is rendered twice inside a
 * 200%-wide track and translated by -50%, so the loop is seamless; the
 * duplicate is aria-hidden and the whole strip is presentational, since a
 * scrolling ticker is decoration and its content appears elsewhere on the
 * page as real copy.
 */
export default function Ticker({
  items,
  reverse = false,
  className,
  tone = "line",
}: {
  items: readonly string[];
  reverse?: boolean;
  className?: string;
  /** `line` is a quiet rule strip; `gold` is the loud full-bleed band. */
  tone?: "line" | "gold";
}) {
  const isGold = tone === "gold";

  return (
    <div
      aria-hidden="true"
      className={`relative flex overflow-hidden border-y ${
        isGold
          ? "border-ss-gold/40 bg-ss-gold text-ss-deep"
          : "border-ss-line bg-ss-deep text-ss-smoke"
      } ${className ?? ""}`}
    >
      <div
        className={`flex w-max shrink-0 items-center ${
          reverse ? "ss-marquee-rev" : "marquee"
        }`}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center">
            {items.map((item, i) => (
              <span key={`${copy}-${i}`} className="flex items-center">
                <span
                  className={`px-5 py-3 font-mono text-[11px] uppercase tracking-[0.28em] whitespace-nowrap ${
                    isGold ? "font-medium" : ""
                  }`}
                >
                  {item}
                </span>
                <StarMark
                  monochrome
                  className={`h-3.5 w-3.5 shrink-0 ${
                    isGold ? "text-ss-deep/60" : "text-ss-line-2"
                  }`}
                />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
