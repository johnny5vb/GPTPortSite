import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Nothing on this site is private — the whole thing is the portfolio, so
 * everything is crawlable. Next serves this at /robots.txt.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
