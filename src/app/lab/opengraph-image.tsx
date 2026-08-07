/**
 * The root `opengraph-image.tsx` only applies to `/` — Next does not cascade
 * metadata image files into child segments. Re-export it here so `/lab` gets
 * the same branded share card instead of no image at all.
 *
 * `runtime` has to be declared literally (Next parses it at compile time and
 * rejects a re-export); everything else can come straight from the root card.
 */
export const runtime = "nodejs";
export { alt, size, contentType, default } from "../opengraph-image";
