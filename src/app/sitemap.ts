import type { MetadataRoute } from "next";
import { PROJECTS } from "@/lib/projects";
import { SITE_URL } from "@/lib/seo";

/**
 * Every public route. Case studies are generated from the same
 * `src/lib/projects.ts` that drives the Work list and `/work/[slug]`, so
 * adding a project adds it to the sitemap automatically.
 *
 * `/capabilities` is intentionally unlinked from the main nav but is a real,
 * shareable page — it belongs in here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/lab`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/capabilities`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...PROJECTS.map((project) => ({
      url: `${SITE_URL}/work/${project.slug}`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
  ];
}
