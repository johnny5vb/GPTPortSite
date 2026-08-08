import type { Metadata, Viewport } from "next";
import { Anton, Space_Grotesk } from "next/font/google";
import BandNav from "@/components/shooting-stars/BandNav";
import { StarLogoDefs } from "@/components/shooting-stars/StarLogo";
import { BAND } from "@/lib/shootingStars";

/**
 * The Shooting Stars is art-directed independently from the portfolio it is
 * hosted inside. This layout binds the band's own typefaces and the `ss-page`
 * scope (see globals.css) to the subtree, so nothing leaks either way:
 * Fraunces/Geist never reach the band site, and the band's poster type never
 * reaches Carman Creative.
 *
 * The global chrome — Nav, SectionRail, CustomCursor — opts out of this route
 * in RouteChrome.tsx and CustomCursor.tsx. Lenis smooth scroll stays on.
 */

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const description =
  "The Shooting Stars are a four-piece garage rock band from Virginia Beach. New single ‘Supernova’ out now, plus fall 2026 tour dates, the full catalog, and booking.";

export const metadata: Metadata = {
  title: `${BAND.name} — Garage Rock from ${BAND.hometown}`,
  description,
  /**
   * Held out of search until the real band content lands.
   *
   * Every name, date, venue, release, and email on this route is a
   * placeholder, and this route is served from carmancreative.com — a
   * professional portfolio domain. Invented tour dates getting indexed
   * against that domain is not a good trade for the SEO of a page nobody
   * is searching for yet.
   *
   * Scoped to this segment only: the portfolio's own routes are unaffected.
   * Delete this block when the real content goes in.
   */
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
  openGraph: {
    title: `${BAND.name} — Garage Rock from ${BAND.hometown}`,
    description,
    url: "/shooting-stars",
    siteName: BAND.name,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${BAND.name} — Garage Rock from ${BAND.hometown}`,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#08070f",
};

export default function ShootingStarsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`ss-page ${anton.variable} ${spaceGrotesk.variable}`}>
      <StarLogoDefs />
      <BandNav />
      {children}
    </div>
  );
}
