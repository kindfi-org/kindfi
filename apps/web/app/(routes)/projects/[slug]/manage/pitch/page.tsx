import { notFound } from 'next/navigation'
import { ProjectPitchForm } from '~/components/sections/projects/pitch/project-pitch-form'
import { TipsSidebar } from '~/components/sections/projects/pitch/tips-sidebar'
import { BreadcrumbContainer } from '~/components/sections/projects/shared'
import { projectDetail } from '~/lib/mock-data/project/project-detail.mock'

// Simulate async data fetching for pitch data
async function getPitchData(slug: string) {
	// Simulate loading delay
	await new Promise((resolve) => setTimeout(resolve, 800))

	if (slug !== projectDetail.slug) {
		return null
	}

	// Return existing pitch data
	return {
		title: projectDetail.pitch.title,
		story: projectDetail.pitch.story,
		pitchDeck: null, // In real app, this would be the existing file
		videoUrl: projectDetail.pitch.videoUrl || '',
	}
}

export default async function ProjectPitchPage({
	params,
}: {
	params: Promise<{
		slug: string
	}>
}) {
	const { slug } = await params

	const pitch = await getPitchData(slug)

	if (!pitch) {
		notFound()
	}

	return (
		<main className="container mx-auto px-4 py-8 md:py-12">
			<div className="flex flex-col items-center justify-center mb-8">
				<BreadcrumbContainer
					category={{ name: 'Education', slug: 'education' }}
					title="Empowering Education"
					manageSection="Project Management"
					subSection="Pitch"
				/>
				<div className="inline-flex items-center px-4 py-2 rounded-full font-medium text-purple-600 bg-purple-100 border-transparent mb-4">
					Project Management
				</div>
				<h1 className="text-3xl md:text-4xl font-bold mb-4 py-2 sm:text-center gradient-text">
					Project Pitch
				</h1>
				<p className="text-xl text-muted-foreground max-w-5xl mx-auto">
					Create a compelling pitch that showcases your project's impact and
					inspires supporters to join your mission.
				</p>
			</div>
			<section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-5xl mx-auto">
				<div className="lg:col-span-2">
					<ProjectPitchForm pitch={pitch} />
				</div>
				<aside className="lg:col-span-1">
					<TipsSidebar />
				</aside>
			</section>
		</main>
	)
}
