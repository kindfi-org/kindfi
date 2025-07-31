import { prefetchSupabaseQuery } from '@packages/lib/supabase/server'
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from '@tanstack/react-query'
import { UpdateProjectForm } from '~/components/sections/projects/create/update-project-form'
import { BreadcrumbContainer } from '~/components/sections/projects/shared'
import { getBasicProjectInfoBySlug } from '~/lib/queries/projects/get-basic-project-info-by-slug'

export default async function UpdateProjectPage({
	params,
}: {
	params: Promise<{
		slug: string
	}>
}) {
	const { slug } = await params

	const queryClient = new QueryClient()

	// Prefetch single project data
	await prefetchSupabaseQuery(
		queryClient,
		'basic-project-info',
		(client) => getBasicProjectInfoBySlug(client, slug),
		[slug],
	)

	// Hydrate React Query cache on the client
	const dehydratedState = dehydrate(queryClient)

	return (
		<main className="container mx-auto px-4 py-8 md:py-12">
			<div className="flex flex-col items-center justify-center mb-8">
				<BreadcrumbContainer
					category={{ name: 'Education', slug: 'education' }}
					title="Empowering Education"
					manageSection="Project Management"
					subSection="Basics"
				/>
				<h1 className="text-3xl md:text-4xl font-bold mb-4 py-2 sm:text-center gradient-text">
					Edit Project Basics
				</h1>
				<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
					Update your project's core information and social media presence.
				</p>
			</div>
			<HydrationBoundary state={dehydratedState}>
				<UpdateProjectForm projectSlug={slug} />
			</HydrationBoundary>
		</main>
	)
}
