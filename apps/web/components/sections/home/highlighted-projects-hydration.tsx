import { prefetchSupabaseQuery } from '@packages/lib/supabase-server'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { Web3Providers } from '~/components/shared/layout/web3-providers'
import { DynamicComponents } from '~/lib/constants/home-page-data'
import { getViewerLocale } from '~/lib/i18n/locale-cookie.server'
import { getAllProjects } from '~/lib/queries/projects'

export async function HighlightedProjectsHydration() {
	const queryClient = new QueryClient()
	const viewerLocale = await getViewerLocale()

	await prefetchSupabaseQuery(
		queryClient,
		'highlighted-projects',
		(client) => getAllProjects(client, [], 'most-recent', 6, { viewerLocale }),
		[viewerLocale],
	)

	return (
		<Web3Providers>
			<HydrationBoundary state={dehydrate(queryClient)}>
				<DynamicComponents.HighlightedProjects />
			</HydrationBoundary>
		</Web3Providers>
	)
}
