import { prefetchSupabaseQuery } from '@packages/lib/supabase-server'
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from '@tanstack/react-query'
import { ProjectMembersWrapper } from '~/components/sections/projects/members/project-members-wrapper'
import { getProjectMembersDataBySlug } from '~/lib/queries/projects/get-project-members-data-by-slug'

export default async function ProjectMembersPage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	const queryClient = new QueryClient()

	// Prefetch project members data
	await prefetchSupabaseQuery(
		queryClient,
		'project-members',
		(client) => getProjectMembersDataBySlug(client, slug),
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
