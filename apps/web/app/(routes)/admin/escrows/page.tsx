import { isAdminOpsDashboardEnabled } from '@packages/lib/admin'
import { prefetchSupabaseQuery } from '@packages/lib/supabase-server'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { AdminEscrowsList } from '~/components/sections/admin/admin-escrows-list'
import { AdminEscrowsPage } from '~/components/sections/admin/escrows/admin-escrows-page'
import { getAdminEscrows } from '~/lib/queries/admin/get-admin-escrows'
import { getAllEscrows } from '~/lib/queries/admin/get-all-escrows'
import { prefetchAdminSurface } from '~/lib/supabase/prefetch-admin-query'
import {
	adminEscrowsQuerySchema,
	normalizeAdminListParams,
	parseAdminListParams,
} from '~/lib/validators/admin-list-params'

export default async function AdminEscrowsRoute({
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
		const params = parseAdminListParams(adminEscrowsQuerySchema, urlParams)

		await prefetchAdminSurface(queryClient, 'escrows', normalizeAdminListParams(params), (client) =>
			getAdminEscrows(client, params),
		)

		return (
			<HydrationBoundary state={dehydrate(queryClient)}>
				<AdminEscrowsPage />
			</HydrationBoundary>
		)
	}

	await prefetchSupabaseQuery(queryClient, 'admin-escrows', (client) => getAllEscrows(client), [])

	const dehydratedState = dehydrate(queryClient)

	return (
		<HydrationBoundary state={dehydratedState}>
			<AdminEscrowsList />
		</HydrationBoundary>
	)
}
