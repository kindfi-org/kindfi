import { prefetchSupabaseQuery } from '@packages/lib/supabase-server'
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from '@tanstack/react-query'
import { EscrowManagementClientWrapper } from '~/components/sections/projects/manage/escrow/escrow-management-client-wrapper'
import { getBasicProjectInfoBySlug } from '~/lib/queries/projects/get-basic-project-info-by-slug'

export default async function EscrowManagePage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	const queryClient = new QueryClient()

	await prefetchSupabaseQuery(
		queryClient,
		'basic-project-info',
		(client) => getBasicProjectInfoBySlug(client, slug),
		[slug],
	)

	const dehydratedState = dehydrate(queryClient)

	return (
		<section className="container mx-auto px-4 py-8 md:py-12">
			<HydrationBoundary state={dehydratedState}>
				<EscrowManagementClientWrapper projectSlug={slug} />
			</HydrationBoundary>
		</section>
	)
}

