import { prefetchSupabaseQuery } from '@packages/lib/supabase-server'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { FoundationsClientWrapper } from '~/components/sections/foundations/foundations-client-wrapper'
import { FoundationsHeader } from '~/components/sections/foundations/foundations-header'
import { SectionContainer } from '~/components/shared/section-container'
import {
	getAllFoundations,
	normalizeFoundationListSort,
} from '~/lib/queries/foundations/get-all-foundations'

export const metadata: Metadata = {
	title: 'Foundations | KindFi',
	description:
		'Discover nonprofit and community foundations on KindFi—missions, campaigns, and transparent impact.',
}

export default async function FoundationsPage({
	searchParams,
}: {
	searchParams: Promise<{ sort?: string }>
}) {
	const queryClient = new QueryClient()
	const { sort } = await searchParams
	const sortSlug = normalizeFoundationListSort(sort)

	await prefetchSupabaseQuery(
		queryClient,
		'foundations',
		(client) => getAllFoundations(client, sortSlug),
		[sortSlug],
	)

	const dehydratedState = dehydrate(queryClient)

	return (
		<main className="min-h-screen bg-muted/30" aria-label="Foundations directory">
			<SectionContainer maxWidth="6xl" className="py-10 sm:py-14 lg:py-16">
				<FoundationsHeader activeSort={sortSlug} />
				<HydrationBoundary state={dehydratedState}>
					<FoundationsClientWrapper />
				</HydrationBoundary>
			</SectionContainer>
		</main>
	)
}
