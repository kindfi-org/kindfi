import { prefetchSupabaseQuery } from '@packages/lib/supabase-server'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { AdminOverviewSkeleton } from '~/components/sections/admin/skeletons'
import { getAdminStats } from '~/lib/queries/admin/get-admin-stats'

const AdminOverview = dynamic(
	() =>
		import('~/components/sections/admin/admin-overview').then((mod) => ({
			default: mod.AdminOverview,
		})),
	{
		loading: () => <AdminOverviewSkeleton />,
	},
)

export default async function AdminDashboardPage() {
	const queryClient = new QueryClient()

	await prefetchSupabaseQuery(queryClient, 'admin-stats', (client) => getAdminStats(client), [])

	const dehydratedState = dehydrate(queryClient)

	return (
		<HydrationBoundary state={dehydratedState}>
			<Suspense fallback={<AdminOverviewSkeleton />}>
				<AdminOverview />
			</Suspense>
		</HydrationBoundary>
	)
}
