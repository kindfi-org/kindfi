import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { ProjectMembersWrapper } from '~/components/sections/projects/members/project-members-wrapper'
import { getProjectTeamBySlug } from '~/lib/queries/projects/get-project-team-by-slug'
import { prefetchManagedProjectQuery } from '~/lib/supabase/prefetch-managed-project-query'

export default async function ProjectMembersPage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	const queryClient = new QueryClient()

	await prefetchManagedProjectQuery(
		queryClient,
		'project-team',
		(client) => getProjectTeamBySlug(client, slug),
		[slug],
	)

	// Hydrate React Query cache on the client
	const dehydratedState = dehydrate(queryClient)

	return (
		<HydrationBoundary state={dehydratedState}>
			<ProjectMembersWrapper projectSlug={slug} />
		</HydrationBoundary>
	)
}
