"use client";

import dynamic from "next/dynamic";

/**
 * The game is client-only: it touches WebGL, WebAudio and localStorage on
 * mount, so there is nothing meaningful to prerender.
 */
const ShredGame = dynamic(() => import("@/game/shred/ui/ShredGame"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "grid",
        placeItems: "center",
        background: "#05070c",
        color: "#fff",
        fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
        fontSize: "0.7rem",
        letterSpacing: "0.24em",
        textTransform: "uppercase",
      }}
    >
      Loading
    </div>
  ),
});

export default function ShredClient() {
  return <ShredGame />;
}
