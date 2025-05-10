import { notFound } from 'next/navigation'
import { ProjectHero } from '~/components/sections/project-detail/project-hero'
import { projectDetail } from '~/lib/mock-data/project/project-detail.mock'

interface ProjectDetailPageProps {
	params: {
		id: string
	}
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
	if (params.id !== projectDetail.id) {
		notFound()
	}

	return (
		<main className="container mx-auto px-4 py-8 md:py-12">
			<ProjectHero project={projectDetail} />
		</main>
	)
}
