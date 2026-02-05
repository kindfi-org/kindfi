import { prefetchSupabaseQuery } from '@packages/lib/supabase-server'
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from '@tanstack/react-query'
import { ProjectMembersWrapper } from '~/components/sections/projects/members/project-members-wrapper'
import { getProjectTeamBySlug } from '~/lib/queries/projects/get-project-team-by-slug'

export default async function ProjectMembersPage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	const queryClient = new QueryClient()

	// Prefetch project team data
	await prefetchSupabaseQuery(
		queryClient,
		'project-team',
		(client) => getProjectTeamBySlug(client, slug),
		[slug],
	)

	// Hydrate React Query cache on the client
	const dehydratedState = dehydrate(queryClient)

	return (
		<section className="container mx-auto px-4 py-8 md:py-12">
			<HydrationBoundary state={dehydratedState}>
				<ProjectMembersWrapper projectSlug={slug} />
			</HydrationBoundary>
		</section>
	)
}
