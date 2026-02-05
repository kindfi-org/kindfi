import { prefetchSupabaseQuery } from '@packages/lib/supabase-server'
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from '@tanstack/react-query'
import { FoundationEscrowAdminClientWrapper } from '~/components/sections/foundations/manage/escrow/foundation-escrow-admin-client-wrapper'
import { getFoundationBySlug } from '~/lib/queries/foundations/get-foundation-by-slug'

export default async function FoundationEscrowManagePage({
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
		<section className="container mx-auto px-4 py-8 md:py-12">
			<HydrationBoundary state={dehydratedState}>
				<FoundationEscrowAdminClientWrapper foundationSlug={slug} />
			</HydrationBoundary>
		</section>
	)
}
