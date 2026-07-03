import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { ProjectPitchWrapper } from '~/components/sections/projects/pitch/project-pitch-wrapper'
import { getProjectPitchDataBySlug } from '~/lib/queries/projects/get-project-pitch-data-by-slug'
import { prefetchManagedProjectQuery } from '~/lib/supabase/prefetch-managed-project-query'

export default async function ProjectPitchPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params

	const queryClient = new QueryClient()

	await prefetchManagedProjectQuery(
		queryClient,
		'project-pitch',
		(client) => getProjectPitchDataBySlug(client, slug),
		[slug],
	)

	// Hydrate React Query cache on the client
	const dehydratedState = dehydrate(queryClient)

	return (
		<HydrationBoundary state={dehydratedState}>
			<ProjectPitchWrapper projectSlug={slug} />
		</HydrationBoundary>
	)
}
