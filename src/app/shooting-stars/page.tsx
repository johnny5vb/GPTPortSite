import BandHero from "@/components/shooting-stars/BandHero";
import BandAbout from "@/components/shooting-stars/BandAbout";
import BandMusic from "@/components/shooting-stars/BandMusic";
import BandTour from "@/components/shooting-stars/BandTour";
import BandPress from "@/components/shooting-stars/BandPress";
import BandContact from "@/components/shooting-stars/BandContact";
import BandFooter from "@/components/shooting-stars/BandFooter";
import Ticker from "@/components/shooting-stars/Ticker";
import { BAND, RELEASES, TICKER } from "@/lib/shootingStars";

/**
 * The Shooting Stars — single-page band site.
 *
 * 00 Hero / 01 The Band / 02 Music / 03 Tour / quotes / 04 Contact.
 * All copy, lineup, dates and releases come from src/lib/shootingStars.ts.
 */

/** Rich result for the band itself — helps the site show up as an act. */
const musicGroupSchema = {
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  name: BAND.name,
  genre: BAND.genre,
  foundingDate: String(BAND.formed),
  foundingLocation: BAND.hometown,
  description: BAND.intro,
  email: BAND.bookingEmail,
  album: RELEASES.map((r) => ({
    "@type": r.kind === "Single" ? "MusicRecording" : "MusicAlbum",
    name: r.title,
    datePublished: String(r.year),
  })),
};

export default function ShootingStarsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Static, author-controlled object — no user input reaches this.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(musicGroupSchema) }}
      />
      <main id="main-content">
        <BandHero />
        <Ticker items={TICKER} tone="gold" />
        <BandAbout />
        <BandMusic />
        <Ticker items={TICKER} reverse className="border-y-0" />
        <BandTour />
        <BandPress />
        <BandContact />
      </main>
      <BandFooter />
    </>
  );
}
