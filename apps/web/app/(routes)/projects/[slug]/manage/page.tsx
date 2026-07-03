import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { ProjectManageOverview } from '~/components/sections/projects/manage/project-manage-overview'
import { getBasicProjectInfoBySlug } from '~/lib/queries/projects/get-basic-project-info-by-slug'
import { prefetchManagedProjectQuery } from '~/lib/supabase/prefetch-managed-project-query'

export default async function ProjectManagementDashboardPage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	const queryClient = new QueryClient()

	await prefetchManagedProjectQuery(
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
