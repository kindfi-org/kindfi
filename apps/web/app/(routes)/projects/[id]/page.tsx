import { notFound } from 'next/navigation'
import { BreadcrumbContainer } from '~/components/sections/project-detail/breadcrumb-container'
import { ProjectHero } from '~/components/sections/project-detail/project-hero'
import { ProjectSidebar } from '~/components/sections/project-detail/project-sidebar'
import { ProjectTabs } from '~/components/sections/project-detail/project-tabs'
import { projectDetail } from '~/lib/mock-data/project/project-detail.mock'

export default async function ProjectDetailPage({
	params,
}: {
	params: Promise<{
		id: string
	}>
}) {
	const { id } = await params

	if (id !== projectDetail.id) {
		notFound()
	}

	return (
		<main className="container mx-auto px-4 py-8 md:py-12">
			<div className="mb-6">
				<BreadcrumbContainer
					title={projectDetail.title}
					category={
						projectDetail.category?.slug
							? {
									name: projectDetail.category.name,
									slug: projectDetail.category.slug,
								}
							: undefined
					}
				/>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2">
					<ProjectHero project={projectDetail} />
					<ProjectTabs project={projectDetail} />
				</div>

				<div className="lg:col-span-1">
					<ProjectSidebar project={projectDetail} />
				</div>
			</div>
		</main>
	)
}
