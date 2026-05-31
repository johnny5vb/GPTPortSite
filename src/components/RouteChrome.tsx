"use client";

import { usePathname } from "next/navigation";
import Nav from "./Nav";
import SectionRail from "./SectionRail";
import ScrollProgress from "./ScrollProgress";
import ScrollBackdrop from "./ScrollBackdrop";

/**
 * Route-aware global chrome. The Capabilities deck has its own header and
 * pagination, so suppress the site nav + section rail there. The section rail
 * only makes sense on the home page (its anchor targets live there). The
 * scroll-driven backdrop also only runs on the home page to avoid double-
 * tinting case study pages.
 */
export default function RouteChrome() {
  const pathname = usePathname() ?? "/";
  const isDeck = pathname.startsWith("/capabilities");
  const isHome = pathname === "/";

  if (isDeck) return null;

  return (
    <>
      {isHome && <ScrollBackdrop />}
      <ScrollProgress />
      <Nav />
      {isHome && <SectionRail />}
    </>
  );
}
