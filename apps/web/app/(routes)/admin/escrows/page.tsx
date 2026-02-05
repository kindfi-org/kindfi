import { prefetchSupabaseQuery } from '@packages/lib/supabase-server'
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from '@tanstack/react-query'
import { AdminEscrowsList } from '~/components/sections/admin/admin-escrows-list'
import { getAllEscrows } from '~/lib/queries/admin/get-all-escrows'

export default async function AdminEscrowsPage() {
	const queryClient = new QueryClient()

	await prefetchSupabaseQuery(
		queryClient,
		'admin-escrows',
		(client) => getAllEscrows(client),
		[],
	)

	const dehydratedState = dehydrate(queryClient)

	return (
		<HydrationBoundary state={dehydratedState}>
			<AdminEscrowsList />
		</HydrationBoundary>
	)
}
