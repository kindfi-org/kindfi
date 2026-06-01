import { prefetchSupabaseQuery } from '@packages/lib/supabase-server'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { AdminAnalyticsSkeleton } from '~/components/sections/admin/skeletons'
import { getAdminStats } from '~/lib/queries/admin/get-admin-stats'

const AdminAnalytics = dynamic(
	() =>
		import('~/components/sections/admin/admin-analytics').then((mod) => ({
			default: mod.AdminAnalytics,
		})),
	{
		loading: () => <AdminAnalyticsSkeleton />,
	},
)

export default async function AdminAnalyticsPage() {
	const queryClient = new QueryClient()

	await prefetchSupabaseQuery(queryClient, 'admin-stats', (client) => getAdminStats(client), [])

	const dehydratedState = dehydrate(queryClient)

	return (
		<HydrationBoundary state={dehydratedState}>
			<Suspense fallback={<AdminAnalyticsSkeleton />}>
				<AdminAnalytics />
			</Suspense>
		</HydrationBoundary>
	)
}
