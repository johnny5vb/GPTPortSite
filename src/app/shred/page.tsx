import type { Metadata, Viewport } from "next";
import ShredClient from "./ShredClient";

export const metadata: Metadata = {
  title: "SHRED // 1999 — a snowboard game",
  description:
    "An arcade snowboard game in the browser. Endless procedural mountains, big airs, and a landing that actually feels like something. Built with Three.js.",
  openGraph: {
    title: "SHRED // 1999",
    description:
      "An arcade snowboard game in the browser. Endless procedural mountains, big airs, and a landing that actually feels like something.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#05070c",
  // The game owns the whole screen: no pinch-zoom to fight the touch controls,
  // and `cover` so the canvas runs under the notch with the HUD inset by the
  // safe-area variables instead.
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function ShredPage() {
  return (
    <main id="main-content">
      <h1 className="sr-only">SHRED // 1999 — a browser snowboard game</h1>
      <ShredClient />
    </main>
  );
}
