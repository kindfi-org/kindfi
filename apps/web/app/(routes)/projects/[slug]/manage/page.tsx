import { prefetchSupabaseQuery } from '@packages/lib/supabase-server'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { ProjectManageOverview } from '~/components/sections/projects/manage/project-manage-overview'
import { getBasicProjectInfoBySlug } from '~/lib/queries/projects/get-basic-project-info-by-slug'

export default async function ProjectManagementDashboardPage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	const queryClient = new QueryClient()

	await prefetchSupabaseQuery(
		queryClient,
		'basic-project-info',
		(client) => getBasicProjectInfoBySlug(client, slug),
		[slug],
	)

	const dehydratedState = dehydrate(queryClient)

	return (
		<HydrationBoundary state={dehydratedState}>
			<ProjectManageOverview slug={slug} />
		</HydrationBoundary>
	)
}
