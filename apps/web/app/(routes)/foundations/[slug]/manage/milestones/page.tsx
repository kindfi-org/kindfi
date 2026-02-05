import { prefetchSupabaseQuery } from '@packages/lib/supabase-server'
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from '@tanstack/react-query'
import { FoundationMilestonesWrapper } from '~/components/sections/foundations/manage/foundation-milestones-wrapper'
import { getFoundationBySlug } from '~/lib/queries/foundations/get-foundation-by-slug'

export default async function FoundationMilestonesPage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	const queryClient = new QueryClient()

	// Prefetch foundation data
	await prefetchSupabaseQuery(
		queryClient,
		'foundation',
		(client) => getFoundationBySlug(client, slug),
		[slug],
	)

	const dehydratedState = dehydrate(queryClient)

	return (
		<HydrationBoundary state={dehydratedState}>
			<FoundationMilestonesWrapper foundationSlug={slug} />
		</HydrationBoundary>
	)
}
