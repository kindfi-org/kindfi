import { prefetchSupabaseQuery } from '@packages/lib/supabase-server'
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from '@tanstack/react-query'
import { FoundationManageOverview } from '~/components/sections/foundations/manage/foundation-manage-overview'
import { getFoundationBySlug } from '~/lib/queries/foundations/get-foundation-by-slug'

export default async function FoundationManagePage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	const queryClient = new QueryClient()

	await prefetchSupabaseQuery(
		queryClient,
		'foundation',
		(client) => getFoundationBySlug(client, slug),
		[slug],
	)

	const dehydratedState = dehydrate(queryClient)

	return (
		<HydrationBoundary state={dehydratedState}>
			<FoundationManageOverview slug={slug} />
		</HydrationBoundary>
	)
}
