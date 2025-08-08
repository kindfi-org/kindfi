import { prefetchSupabaseQuery } from '@packages/lib/supabase-server'
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from '@tanstack/react-query'
import { ProjectPitchWrapper } from '~/components/sections/projects/pitch/project-pitch-wrapper'
import { getProjectPitchDataBySlug } from '~/lib/queries/projects/get-project-pitch-data-by-slug'

export default async function ProjectPitchPage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params

	const queryClient = new QueryClient()

	// Prefetch project pitch data
	await prefetchSupabaseQuery(
		queryClient,
		'project-pitch',
		(client) => getProjectPitchDataBySlug(client, slug),
		[slug],
	)

	// Hydrate React Query cache on the client
	const dehydratedState = dehydrate(queryClient)

	return (
		<div className="container mx-auto px-4 py-8 md:py-12">
			<HydrationBoundary state={dehydratedState}>
				<ProjectPitchWrapper projectSlug={slug} />
			</HydrationBoundary>
		</div>
	)
}
