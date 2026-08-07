import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectDetail from "@/components/ProjectDetail";
import Footer from "@/components/Footer";
import { PROJECTS, getProject, getAdjacentProjects } from "@/lib/projects";
import { pageMetadata } from "@/lib/seo";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) {
    return {
      title: "Project not found — Carman Creative",
      robots: { index: false, follow: true },
    };
  }
  // `oneLiner` is the project's own single-sentence description; the longer
  // `brief` reads as body copy and gets truncated in every preview card.
  // Share images come from the colocated opengraph-image.tsx.
  return pageMetadata({
    title: `${project.title} — Carman Creative`,
    description: `${project.oneLiner} ${project.category} for ${project.client}, ${project.year}.`,
    path: `/work/${project.slug}`,
    type: "article",
  });
}

export default async function Page({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const { prev, next } = getAdjacentProjects(slug);

  return (
    <main id="main-content" className="relative">
      <ProjectDetail project={project} prev={prev} next={next} />
      <Footer />
    </main>
  );
}
