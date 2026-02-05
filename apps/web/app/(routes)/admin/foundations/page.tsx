import { prefetchSupabaseQuery } from '@packages/lib/supabase-server'
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from '@tanstack/react-query'
import { AdminFoundationsList } from '~/components/sections/admin/admin-foundations-list'
import { getAllFoundations } from '~/lib/queries/foundations/get-all-foundations'

export default async function AdminFoundationsPage() {
	const queryClient = new QueryClient()

	await prefetchSupabaseQuery(
		queryClient,
		'admin-foundations',
		(client) => getAllFoundations(client, 'most-recent', 1000),
		[],
	)

	const dehydratedState = dehydrate(queryClient)

	return (
		<HydrationBoundary state={dehydratedState}>
			<AdminFoundationsList />
		</HydrationBoundary>
	)
}
