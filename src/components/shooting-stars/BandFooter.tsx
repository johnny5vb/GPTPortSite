import { BandBadge, LogoLockup } from "./StarLogo";
import { BAND, SOCIALS } from "@/lib/shootingStars";

/**
 * Closing block. The seal gets one large, unhurried appearance here — it is
 * the last thing on the page and the thing that would end up on a t-shirt.
 */
export default function BandFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-ss-line bg-ss-deep">
      <div className="mx-auto max-w-[88rem] px-5 py-16 md:px-10 md:py-20">
        <div className="flex flex-col items-center gap-8 text-center">
          <BandBadge className="ss-spin h-32 w-32 opacity-90 md:h-40 md:w-40" />
          <p className="ss-display text-[clamp(2.2rem,8vw,5.5rem)] text-ss-cream">
            Play it loud.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-12 gap-8 border-t border-ss-line pt-10">
          <div className="col-span-12 md:col-span-4">
            <LogoLockup markClassName="h-8 w-8" textClassName="text-[1rem]" />
            <p className="mt-4 max-w-[30ch] text-sm leading-relaxed text-ss-smoke">
              {BAND.tagline}
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="col-span-6 md:col-span-3 md:col-start-6"
          >
            <h2 className="font-mono text-[10px] tracking-[0.24em] text-ss-smoke uppercase">
              Site
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { href: "#music", label: "Music" },
                { href: "#about", label: "The band" },
                { href: "#tour", label: "Tour dates" },
                { href: "#contact", label: "Contact" },
              ].map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="text-ss-cream transition-colors hover:text-ss-gold"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-6 md:col-span-3">
            <h2 className="font-mono text-[10px] tracking-[0.24em] text-ss-smoke uppercase">
              Elsewhere
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    className="text-ss-cream transition-colors hover:text-ss-gold"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${BAND.bookingEmail}`}
                  className="text-ss-cream transition-colors hover:text-ss-gold"
                >
                  Booking
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-ss-line pt-6 font-mono text-[10px] tracking-[0.22em] text-ss-smoke uppercase sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {BAND.formed}—2026 {BAND.name}
          </span>
          <span>{BAND.hometown} / Still practicing</span>
        </div>
      </div>
    </footer>
  );
}
