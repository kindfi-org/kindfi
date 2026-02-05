import { prefetchSupabaseQuery } from '@packages/lib/supabase-server'
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from '@tanstack/react-query'
import type { Metadata } from 'next'
import { FoundationsClientWrapper } from '~/components/sections/foundations/foundations-client-wrapper'
import { FoundationsHeader } from '~/components/sections/foundations/foundations-header'
import { getAllFoundations } from '~/lib/queries/foundations/get-all-foundations'

export const metadata: Metadata = {
	title: 'Foundations | KindFi',
	description:
		'Discover and support impactful foundations. Explore their missions, campaigns, and impact.',
}

export default async function FoundationsPage({
	searchParams,
}: {
	searchParams: Promise<{ sort?: string }>
}) {
	const queryClient = new QueryClient()
	const { sort } = await searchParams
	const sortSlug = sort ?? 'most-recent'

	await prefetchSupabaseQuery(
		queryClient,
		'foundations',
		(client) => getAllFoundations(client, sortSlug),
		[sortSlug],
	)

	const dehydratedState = dehydrate(queryClient)

	return (
		<main className="container mx-auto p-4 md:p-12">
			<FoundationsHeader />
			<HydrationBoundary state={dehydratedState}>
				<FoundationsClientWrapper />
			</HydrationBoundary>
		</main>
	)
}
