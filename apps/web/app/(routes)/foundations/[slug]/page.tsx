import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from '@tanstack/react-query'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { FoundationDetailClientWrapper } from '~/components/sections/foundations/foundation-detail-client-wrapper'
import { getFoundationBySlug } from '~/lib/queries/foundations/get-foundation-by-slug'

interface FoundationDetailPageProps {
	params: Promise<{ slug: string }>
}

const defaultUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

/** Per-request cached fetch so metadata and page share one foundation load */
const getFoundationCached = cache(async (slug: string) => {
	const supabase = await createSupabaseServerClient()
	return getFoundationBySlug(supabase, slug)
})

export async function generateMetadata({
	params,
}: FoundationDetailPageProps): Promise<Metadata> {
	const { slug } = await params
	const foundation = await getFoundationCached(slug)

	if (!foundation) {
		return {
			title: 'Foundation Not Found',
			description: 'The foundation you are looking for does not exist.',
		}
	}

	const title = `${foundation.name} | KindFi Foundation`
	const description =
		foundation.description ??
		`Support ${foundation.name} and their mission to make a difference. Explore their campaigns and impact.`

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			type: 'website',
			url: `${defaultUrl}/foundations/${slug}`,
			siteName: 'KindFi',
			images:
				foundation.logoUrl != null
					? [
							{
								url: foundation.logoUrl,
								width: 1200,
								height: 630,
								alt: `${foundation.name} logo`,
							},
						]
					: foundation.coverImageUrl != null
						? [
								{
									url: foundation.coverImageUrl,
									width: 1200,
									height: 630,
									alt: `${foundation.name} cover image`,
								},
							]
						: [],
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			images:
				foundation.logoUrl != null
					? [foundation.logoUrl]
					: foundation.coverImageUrl != null
						? [foundation.coverImageUrl]
						: [],
		},
		alternates: {
			canonical: `${defaultUrl}/foundations/${slug}`,
		},
	}
}

export default async function FoundationDetailPage({
	params,
}: FoundationDetailPageProps) {
	const { slug } = await params
	const foundation = await getFoundationCached(slug)

	if (!foundation) {
		notFound()
	}

	const queryClient = new QueryClient()
	queryClient.setQueryData(['supabase', 'foundation', slug], foundation)
	const dehydratedState = dehydrate(queryClient)

	return (
		<main className="container mx-auto p-4 md:p-12">
			<HydrationBoundary state={dehydratedState}>
				<FoundationDetailClientWrapper slug={slug} />
			</HydrationBoundary>
		</main>
	)
}
