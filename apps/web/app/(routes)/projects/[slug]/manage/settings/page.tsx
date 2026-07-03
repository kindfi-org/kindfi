import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { EscrowAdminClientWrapper } from '~/components/sections/projects/manage/escrow/escrow-admin-client-wrapper'
import { getBasicProjectInfoBySlug } from '~/lib/queries/projects/get-basic-project-info-by-slug'
import { prefetchManagedProjectQuery } from '~/lib/supabase/prefetch-managed-project-query'

export default async function SettingPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params
	const queryClient = new QueryClient()

	await prefetchManagedProjectQuery(
		queryClient,
		'basic-project-info',
		(client) => getBasicProjectInfoBySlug(client, slug),
		[slug],
	)

	const dehydratedState = dehydrate(queryClient)

	return (
		<HydrationBoundary state={dehydratedState}>
			<EscrowAdminClientWrapper projectSlug={slug} />
		</HydrationBoundary>
	)
}
