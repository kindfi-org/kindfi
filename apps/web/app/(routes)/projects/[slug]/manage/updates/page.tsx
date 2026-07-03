import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { ProjectUpdatesManage } from '~/components/sections/projects/manage/project-updates-manage'
import { getProjectUpdatesForManage } from '~/lib/queries/projects/get-project-updates-for-manage'
import { prefetchManagedProjectQuery } from '~/lib/supabase/prefetch-managed-project-query'

export default async function ProjectUpdatesManagePage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	const queryClient = new QueryClient()

	await prefetchManagedProjectQuery(
		queryClient,
		'project-updates-manage',
		(client) => getProjectUpdatesForManage(client, slug),
		[slug],
	)

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ProjectUpdatesManage />
		</HydrationBoundary>
	)
}
