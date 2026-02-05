import { prefetchSupabaseQuery } from '@packages/lib/supabase-server'
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from '@tanstack/react-query'
import { AdminAnalytics } from '~/components/sections/admin/admin-analytics'
import { getAdminStats } from '~/lib/queries/admin/get-admin-stats'

export default async function AdminAnalyticsPage() {
	const queryClient = new QueryClient()

	await prefetchSupabaseQuery(
		queryClient,
		'admin-stats',
		(client) => getAdminStats(client),
		[],
	)

	const dehydratedState = dehydrate(queryClient)

	return (
		<HydrationBoundary state={dehydratedState}>
			<AdminAnalytics />
		</HydrationBoundary>
	)
}
