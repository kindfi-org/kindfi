import { prefetchSupabaseQuery } from '@packages/lib/supabase-server'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { FoundationsClientWrapper } from '~/components/sections/foundations/foundations-client-wrapper'
import { FoundationsHero } from '~/components/sections/foundations/foundations-hero'
import { JsonLd } from '~/components/shared/json-ld'
import { getViewerLocale } from '~/lib/i18n/locale-cookie.server'
import {
	getAllFoundations,
	normalizeFoundationListSort,
} from '~/lib/queries/foundations/get-all-foundations'
import { getBreadcrumbSchema } from '~/lib/seo/structured-data'

export const metadata: Metadata = {
	title: 'Foundations | KindFi',
	description:
		'Discover nonprofit and community foundations on KindFi—missions, campaigns, and transparent impact on the Stellar blockchain.',
	openGraph: {
		title: 'Foundations | KindFi',
		description:
			'Explore verified organizations running campaigns on KindFi. Follow their work and support causes that match your values.',
		type: 'website',
		url: '/foundations',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Foundations | KindFi',
		description: 'Discover verified foundations and their impact campaigns on KindFi.',
	},
	alternates: {
		canonical: '/foundations',
	},
}

export default async function FoundationsPage({
	searchParams,
}: {
	searchParams: Promise<{ sort?: string }>
}) {
	const queryClient = new QueryClient()
	const { sort } = await searchParams
	const sortSlug = normalizeFoundationListSort(sort)
	const viewerLocale = await getViewerLocale()

	await prefetchSupabaseQuery(
		queryClient,
		'foundations',
		(client) => getAllFoundations(client, sortSlug, undefined, { viewerLocale }),
		[sortSlug, viewerLocale],
	)

	const dehydratedState = dehydrate(queryClient)

	return (
		<>
			<JsonLd
				data={getBreadcrumbSchema([
					{ name: 'Home', url: '/' },
					{ name: 'Foundations', url: '/foundations' },
				])}
			/>
			<HydrationBoundary state={dehydratedState}>
				<FoundationsHero sortSlug={sortSlug} />
				<FoundationsClientWrapper />
			</HydrationBoundary>
		</>
	)
}
