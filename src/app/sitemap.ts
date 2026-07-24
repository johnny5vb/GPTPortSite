import type { MetadataRoute } from "next";
import { PROJECTS } from "@/lib/projects";

const BASE = "https://www.carmancreative.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/leadership",
    "/lab",
    "/resume",
    "/capabilities",
  ].map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const work = PROJECTS.map((p) => ({
    url: `${BASE}/work/${p.slug}`,
    changeFrequency: "monthly" as const,
    priority: p.tier === "leadership" ? 0.8 : 0.5,
  }));

  return [...routes, ...work];
}
