import { isAdminOpsDashboardEnabled } from '@packages/lib/admin'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { AdminProjectsList } from '~/components/sections/admin/admin-projects-list'
import { AdminProjectsPage } from '~/components/sections/admin/projects/admin-projects-page'
import {
	getAdminProjectFilterOptions,
	getAdminProjects,
} from '~/lib/queries/admin/get-admin-projects'
import { getAllProjects } from '~/lib/queries/projects/get-all-projects'
import { prefetchAdminQuery, prefetchAdminSurface } from '~/lib/supabase/prefetch-admin-query'
import {
	adminProjectsQuerySchema,
	normalizeAdminListParams,
	parseAdminListParams,
} from '~/lib/validators/admin-list-params'

export default async function AdminProjectsRoute({
	searchParams,
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
	const queryClient = new QueryClient()

	if (isAdminOpsDashboardEnabled()) {
		const resolvedParams = await searchParams
		const urlParams = new URLSearchParams()
		for (const [key, value] of Object.entries(resolvedParams)) {
			if (typeof value === 'string') urlParams.set(key, value)
		}
		const params = parseAdminListParams(adminProjectsQuerySchema, urlParams)

		await prefetchAdminSurface(
			queryClient,
			'projects',
			normalizeAdminListParams(params),
			async (client) => {
				const [result, filterOptions] = await Promise.all([
					getAdminProjects(client, params),
					getAdminProjectFilterOptions(client),
				])
				return { ...result, filterOptions }
			},
		)

		return (
			<HydrationBoundary state={dehydrate(queryClient)}>
				<AdminProjectsPage />
			</HydrationBoundary>
		)
	}

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
