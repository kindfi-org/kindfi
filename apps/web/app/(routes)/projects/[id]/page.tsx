import { prefetchSupabaseQuery } from '@packages/lib/supabase/server'
import {
	HydrationBoundary,
	QueryClient,
	dehydrate,
} from '@tanstack/react-query'
import { ProjectClientWrapper } from '~/components/sections/projects/detail/project-client-wrapper'
import { getProjectById } from '~/lib/queries/projects'

export default async function ProjectDetailPage({
	params,
}: {
	params: Promise<{
		id: string
	}>
}) {
	const queryClient = new QueryClient()

	const { id } = await params

	// Prefetch single project data
	await prefetchSupabaseQuery(
		queryClient,
		'project',
		(client) => getProjectById(client, id),
		[id],
	)

	// Hydrate React Query cache on the client
	const dehydratedState = dehydrate(queryClient)

	return (
		<main className="container mx-auto p-4 md:p-12">
			<HydrationBoundary state={dehydratedState}>
				<ProjectClientWrapper projectId={id} />
			</HydrationBoundary>
		</main>
	)
}
