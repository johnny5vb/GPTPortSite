/**
 * See `src/app/lab/opengraph-image.tsx` — metadata image files don't cascade
 * into child segments, so `/capabilities` re-exports the site-wide card too.
 */
export const runtime = "nodejs";
export { alt, size, contentType, default } from "../opengraph-image";
