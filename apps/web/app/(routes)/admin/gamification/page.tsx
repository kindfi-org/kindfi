import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from '@tanstack/react-query'
import { AdminGamificationManager } from '~/components/sections/admin/admin-gamification-manager'
import { prefetchSupabaseQuery } from '@packages/lib/supabase-server'

export default async function AdminGamificationPage() {
	const queryClient = new QueryClient()

	// Prefetch quests
	await prefetchSupabaseQuery(
		queryClient,
		'quests',
		async (supabase) => {
			const { data, error } = await supabase
				.from('quest_definitions')
				.select('*')
				.order('quest_id', { ascending: true })

			if (error) throw error
			return { quests: data || [] }
		},
		[],
	)

	const dehydratedState = dehydrate(queryClient)

	return (
		<HydrationBoundary state={dehydratedState}>
			<AdminGamificationManager />
		</HydrationBoundary>
	)
}
