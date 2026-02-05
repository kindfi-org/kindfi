import { prefetchSupabaseQuery } from '@packages/lib/supabase-server'
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from '@tanstack/react-query'
import { AdminUsersList } from '~/components/sections/admin/admin-users-list'
import { getAllUsers } from '~/lib/queries/admin/get-all-users'

export default async function AdminUsersPage() {
	const queryClient = new QueryClient()

	await prefetchSupabaseQuery(
		queryClient,
		'admin-users',
		(client) => getAllUsers(client),
		[],
	)

	const dehydratedState = dehydrate(queryClient)

	return (
		<HydrationBoundary state={dehydratedState}>
			<AdminUsersList />
		</HydrationBoundary>
	)
}
