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
  // The game is a full-screen canvas app with its own HUD and pause menu —
  // the site nav, rail and scroll progress have nothing to do there.
  const isGame = pathname.startsWith("/shred");
  const isHome = pathname === "/";

  if (isDeck || isGame) return null;

  return (
    <>
      {isHome && <ScrollBackdrop />}
      <ScrollProgress />
      <Nav />
      {isHome && <SectionRail />}
    </>
  );
}
