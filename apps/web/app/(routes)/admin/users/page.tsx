import { isAdminOpsDashboardEnabled } from '@packages/lib/admin'
import { prefetchSupabaseQuery } from '@packages/lib/supabase-server'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { AdminUsersList } from '~/components/sections/admin/admin-users-list'
import { AdminUsersPage } from '~/components/sections/admin/users/admin-users-page'
import { getAdminUsers } from '~/lib/queries/admin/get-admin-users'
import { getAllUsers } from '~/lib/queries/admin/get-all-users'
import { prefetchAdminSurface } from '~/lib/supabase/prefetch-admin-query'
import {
	adminUsersQuerySchema,
	normalizeAdminListParams,
	parseAdminListParams,
} from '~/lib/validators/admin-list-params'

export default async function AdminUsersRoute({
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
		const params = parseAdminListParams(adminUsersQuerySchema, urlParams)

		await prefetchAdminSurface(queryClient, 'users', normalizeAdminListParams(params), (client) =>
			getAdminUsers(client, params),
		)

		return (
			<HydrationBoundary state={dehydrate(queryClient)}>
				<AdminUsersPage />
			</HydrationBoundary>
		)
	}

	await prefetchSupabaseQuery(queryClient, 'admin-users', (client) => getAllUsers(client), [])

	const dehydratedState = dehydrate(queryClient)

	return (
		<HydrationBoundary state={dehydratedState}>
			<AdminUsersList />
		</HydrationBoundary>
	)
}
