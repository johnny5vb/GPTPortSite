import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectDetail from "@/components/ProjectDetail";
import Footer from "@/components/Footer";
import { PROJECTS, getProject, getAdjacentProjects } from "@/lib/projects";

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
  if (!project) return { title: "Project not found — Carman Creative" };
  return {
    title: `${project.title} — Carman Creative`,
    description: project.brief,
    openGraph: {
      title: `${project.title} — Carman Creative`,
      description: project.brief,
      images: [project.cover],
    },
  };
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
