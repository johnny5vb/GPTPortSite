/**
 * Shared SEO constants + a small helper for per-page metadata.
 *
 * Every route in the app is expected to export its own `metadata` (or
 * `generateMetadata`) built through `pageMetadata()` so that title,
 * description, canonical URL, Open Graph, and Twitter tags stay in lockstep
 * and can never drift apart page to page.
 *
 * Share images are NOT declared here — they come from the `opengraph-image`
 * file convention (`src/app/opengraph-image.tsx` for the site default,
 * `src/app/work/[slug]/opengraph-image.tsx` per case study), which emits
 * absolute URLs, correct dimensions, and the matching `twitter:image`.
 */

import type { Metadata } from "next";

export const SITE_URL = "https://www.carmancreative.com";
export const SITE_NAME = "Carman Creative";
export const SITE_TITLE =
  "Carman Creative — Creative Direction, Accelerated by AI";
export const SITE_DESCRIPTION =
  "John Carman. Creative Director and AI strategist with 20+ years turning complex, enterprise-scale programs into clear, distinctive creative work. Studio in Virginia Beach, Philadelphia, and Brooklyn.";

type PageMeta = {
  /** Full <title> for the page. */
  title: string;
  /** Meta + OG + Twitter description. One or two sentences. */
  description: string;
  /** Route path, leading slash, no trailing slash (use "/" for home). */
  path: string;
  /** OG type — "website" for standard pages, "article" for case studies. */
  type?: "website" | "article";
  /** Shorter title for share cards, when the full <title> is unwieldy. */
  shareTitle?: string;
};

export function pageMetadata({
  title,
  description,
  path,
  type = "website",
  shareTitle,
}: PageMeta): Metadata {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  const social = shareTitle ?? title;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: social,
      description,
      url,
      siteName: SITE_NAME,
      type,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: social,
      description,
    },
  };
}
