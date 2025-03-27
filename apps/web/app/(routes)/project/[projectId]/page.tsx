import { notFound } from "next/navigation";
import { projects } from "~/lib/mock-data/mock-projects";
import type { Metadata } from "next";
import { ProjectDetailView } from "~/components/pages/project/project-information/project-detail-view";

interface ProjectPageParams {
  projectId: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<ProjectPageParams>;
}): Promise<Metadata> {
  const { projectId } = await params;
  const project = projects.find((p) => p.id.toString() === projectId);

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: `${project.title} | KindFi`,
    description: project.description,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<ProjectPageParams>;
}) {
  const { projectId } = await params;
  const project = projects.find((p) => p.id.toString() === projectId);

  if (!project) {
    notFound();
  }

  return <ProjectDetailView project={project} />;
}
