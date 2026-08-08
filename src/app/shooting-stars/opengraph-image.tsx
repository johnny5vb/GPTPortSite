import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";
import { BAND } from "@/lib/shootingStars";

/**
 * Share card for the band site — a gig poster at 1200×630. Anton is read from
 * /public/fonts at request time (Node runtime), same approach as the
 * portfolio's root OG image.
 *
 * Satori supports a subset of CSS: no background-clip text, no gradients on
 * text, and every element needs an explicit `display`. The comet is drawn as
 * plain divs rather than SVG for that reason.
 */

export const runtime = "nodejs";
export const alt = `${BAND.name} — garage rock from ${BAND.hometown}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const fontsDir = path.join(process.cwd(), "public/fonts");
  const anton = fs.readFileSync(path.join(fontsDir, "Anton-Regular.ttf"));
  const grotesk = fs.readFileSync(
    path.join(fontsDir, "SpaceGrotesk-Bold.ttf")
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "radial-gradient(circle at 78% 12%, #221a4d 0%, #08070f 58%)",
          color: "#f6f2e9",
          padding: "64px 72px",
          fontFamily: "Anton",
        }}
      >
        {/* Comet streak across the upper right. */}
        <div
          style={{
            position: "absolute",
            top: 96,
            right: -40,
            width: 620,
            height: 6,
            transform: "rotate(-28deg)",
            borderRadius: 999,
            background:
              "linear-gradient(90deg, rgba(124,92,255,0) 0%, #ff5a3c 62%, #ffc94a 100%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 22,
            right: 74,
            width: 34,
            height: 34,
            borderRadius: 999,
            background: "#ffc94a",
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            fontFamily: "Space Grotesk",
            fontSize: 21,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#a49dba",
          }}
        >
          {BAND.hometown} &nbsp;/&nbsp; Est. {BAND.formed}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 44,
              letterSpacing: 22,
              color: "#a49dba",
            }}
          >
            THE
          </div>
          <div style={{ display: "flex", fontSize: 168, lineHeight: 0.86 }}>
            SHOOTING
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 168,
              lineHeight: 0.86,
              color: "#ffc94a",
            }}
          >
            STARS
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #322d4d",
            paddingTop: 26,
            fontFamily: "Space Grotesk",
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#f6f2e9",
          }}
        >
          <div style={{ display: "flex" }}>New single — Supernova</div>
          <div style={{ display: "flex", color: "#a49dba" }}>
            Fall 2026 tour on sale
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Anton", data: anton, weight: 400, style: "normal" },
        { name: "Space Grotesk", data: grotesk, weight: 700, style: "normal" },
      ],
    }
  );
}
