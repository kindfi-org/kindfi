import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { FoundationDetailClientWrapper } from '~/components/sections/foundations/foundation-detail-client-wrapper'
import { JsonLd } from '~/components/shared/json-ld'
import { getViewerLocale } from '~/lib/i18n/locale-cookie.server'
import { getFoundationBySlug } from '~/lib/queries/foundations/get-foundation-by-slug'
import { getBreadcrumbSchema } from '~/lib/seo/structured-data'

interface FoundationDetailPageProps {
	params: Promise<{ slug: string }>
}

const defaultUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

/** Per-request cached fetch so metadata and page share one foundation load */
const getFoundationCached = cache(async (slug: string) => {
	const supabase = await createSupabaseServerClient()
	const viewerLocale = await getViewerLocale()
	return getFoundationBySlug(supabase, slug, { viewerLocale })
})

export async function generateMetadata({ params }: FoundationDetailPageProps): Promise<Metadata> {
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

export default async function FoundationDetailPage({ params }: FoundationDetailPageProps) {
	const { slug } = await params
	const foundation = await getFoundationCached(slug)

	if (!foundation) {
		notFound()
	}

	const queryClient = new QueryClient()
	queryClient.setQueryData(['supabase', 'foundation', slug], foundation)
	const dehydratedState = dehydrate(queryClient)

	return (
		<>
			<JsonLd
				data={getBreadcrumbSchema([
					{ name: 'Home', url: '/' },
					{ name: 'Foundations', url: '/foundations' },
					{ name: foundation.name, url: `/foundations/${slug}` },
				])}
			/>
			<main
				className="relative isolate min-h-screen overflow-hidden bg-[#fafbfc]"
				aria-label={`${foundation.name} foundation profile`}
			>
				<div className="pointer-events-none absolute inset-0" aria-hidden="true">
					<div className="absolute inset-0 bg-grid-slate-100/50 mask-[radial-gradient(ellipse_at_top,white,transparent_70%)]" />
					<div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
					<div className="absolute -right-20 top-56 h-80 w-80 rounded-full bg-teal-100/40 blur-3xl" />
				</div>
				<div className="relative container mx-auto px-4 py-8 md:px-8 md:py-12 lg:py-14">
					<HydrationBoundary state={dehydratedState}>
						<FoundationDetailClientWrapper slug={slug} />
					</HydrationBoundary>
				</div>
			</main>
		</>
	)
}
