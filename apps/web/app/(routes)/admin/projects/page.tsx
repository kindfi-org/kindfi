import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { AdminProjectsList } from '~/components/sections/admin/admin-projects-list'
import { getAllProjects } from '~/lib/queries/projects/get-all-projects'
import { prefetchAdminQuery } from '~/lib/supabase/prefetch-admin-query'

export default async function AdminProjectsPage() {
	const queryClient = new QueryClient()

	await prefetchAdminQuery(queryClient, 'admin-projects', (client) =>
		getAllProjects(client, [], 'most-recent', 1000),
	)

	const dehydratedState = dehydrate(queryClient)

	return (
		<HydrationBoundary state={dehydratedState}>
			<AdminProjectsList />
		</HydrationBoundary>
	)
}
