import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";
import { PROJECTS, getProject } from "@/lib/projects";

/**
 * Per-case-study share card. Same recipe as the site-wide
 * `src/app/opengraph-image.tsx` (Node runtime so the Fraunces TTFs can be read
 * off disk), but composited over the project's own cover art with a dark scrim
 * so the title stays legible on any photo.
 *
 * Next serves this for both `og:image` and `twitter:image` on `/work/[slug]`,
 * at the 1200×630 the platforms expect — the raw cover files are all different
 * aspect ratios and would get cropped unpredictably.
 */

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateImageMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  return [
    {
      id: "cover",
      size,
      contentType,
      alt: project
        ? `${project.title} — ${project.category} by Carman Creative`
        : "Carman Creative",
    },
  ];
}

/** Reads a file under /public and returns it as an inline data URI. */
function publicDataUri(publicPath: string): string {
  const file = path.join(process.cwd(), "public", publicPath);
  const ext = path.extname(file).toLowerCase();
  const mime = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
  return `data:${mime};base64,${fs.readFileSync(file).toString("base64")}`;
}

export default async function Image({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = getProject(slug);

  const fontsDir = path.join(process.cwd(), "public/fonts");
  const fraunces = fs.readFileSync(path.join(fontsDir, "Fraunces-Medium.ttf"));

  const cover = project ? publicDataUri(project.cover) : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: "#080808",
          color: "#f5f3ef",
          fontFamily: "Fraunces",
        }}
      >
        {cover && (
          <img
            src={cover}
            alt=""
            width={size.width}
            height={size.height}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: size.width,
              height: size.height,
              objectFit: "cover",
            }}
          />
        )}

        {/* Scrim — dark at the bottom where the type sits, lighter up top. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size.width,
            height: size.height,
            background:
              "linear-gradient(180deg, rgba(8,8,8,0.38) 0%, rgba(8,8,8,0.68) 45%, rgba(8,8,8,0.97) 100%)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            padding: "0 80px 76px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#1cb791",
            }}
          >
            {project
              ? `${project.category} / ${project.year}`
              : "Carman Creative"}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 86,
              lineHeight: 1.05,
              letterSpacing: -3,
            }}
          >
            {project?.title ?? "Selected work"}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 28,
              paddingTop: 24,
              borderTop: "1px solid #2a2a2a",
              justifyContent: "space-between",
              fontSize: 22,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#8a8a8a",
            }}
          >
            <span>Carman Creative</span>
            <span>carmancreative.com</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Fraunces", data: fraunces, style: "normal", weight: 500 },
      ],
    }
  );
}
