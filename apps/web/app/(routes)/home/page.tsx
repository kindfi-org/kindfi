import { prefetchSupabaseQuery } from '@packages/lib/supabase/server'
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from '@tanstack/react-query'
import { HomeDashboard } from '~/components/pages/home'
import { getAllProjects } from '~/lib/queries/projects'

export default async function HomePage() {
	const queryClient = new QueryClient()

	// Prefetch project data from Supabase with limit
	await prefetchSupabaseQuery(queryClient, 'highlighted-projects', (client) =>
		getAllProjects(client, [], 'most-recent', 6),
	)

	// Hydrate React Query cache on the client
	const dehydratedState = dehydrate(queryClient)

	return (
		<HydrationBoundary state={dehydratedState}>
			<HomeDashboard />
		</HydrationBoundary>
	)
}
