"use client";

import Image from "next/image";
import {
  photoAlt,
  photoUrl,
  type PhotoCategory,
  type PhotoSlot,
} from "@/lib/photos";

type Treatment = "tinted" | "duotone" | "natural";

type Props = {
  category: PhotoCategory;
  slot: PhotoSlot;
  /** Brand accent color used in the tint overlay */
  accent: string;
  /** Brand background color used in the vignette / edges */
  bg: string;
  /** "tinted" lays brand-tint gradient overlay; "duotone" desaturates + tints harder; "natural" leaves photo unmodified */
  treatment?: Treatment;
  /** Pixel width hint for Unsplash sizing */
  width?: number;
  className?: string;
  /** Tailwind sizes attr passthrough */
  sizes?: string;
  /** Force priority loading */
  priority?: boolean;
};

/**
 * Real Unsplash photography wrapped in a brand-color treatment so it reads
 * as part of the active brand's world rather than a generic stock photo.
 *
 * - "tinted" (default): subtle accent-color gradient + vignette overlay
 * - "duotone": light desaturation + stronger accent tint for editorial moments
 * - "natural": pure photo, no overlay
 */
export default function CategoryImage({
  category,
  slot,
  accent,
  bg,
  treatment = "tinted",
  width = 900,
  className,
  sizes = "(max-width: 768px) 100vw, 600px",
  priority = false,
}: Props) {
  const src = photoUrl(category, slot, width);
  const alt = photoAlt(category, slot);

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
        style={
          treatment === "duotone"
            ? { filter: "grayscale(0.55) contrast(1.06) brightness(0.95)" }
            : undefined
        }
      />

      {treatment !== "natural" && (
        <>
          {/* Brand-accent tint */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none mix-blend-multiply"
            style={{
              background:
                treatment === "duotone"
                  ? `linear-gradient(135deg, ${accent}80, ${accent}40 60%, ${bg}66)`
                  : `linear-gradient(135deg, ${accent}33, transparent 55%, ${bg}55)`,
            }}
          />

          {/* Vignette to bond the edges with the surface */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: `inset 0 0 56px 8px ${bg}80`,
            }}
          />
        </>
      )}
    </div>
  );
}
