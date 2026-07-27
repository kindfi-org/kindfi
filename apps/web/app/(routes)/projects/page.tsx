import { createSupabaseServerClient, prefetchSupabaseQuery } from '@packages/lib/supabase-server'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { ProjectsClientWrapper } from '~/components/sections/projects/projects-client-wrapper'
import { ProjectsHero } from '~/components/sections/projects/projects-hero'
import { JsonLd } from '~/components/shared/json-ld'
import { PROJECTS_PAGE_SIZE } from '~/hooks/projects/use-paginated-projects'
import { getViewerLocale } from '~/lib/i18n/locale-cookie.server'
import { getAllCategories, getAllProjects } from '~/lib/queries/projects'
import { getBreadcrumbSchema } from '~/lib/seo/structured-data'

export const metadata: Metadata = {
	title: 'Projects | KindFi',
	description:
		'Explore and support transparent crowdfunding projects on KindFi. Filter by category, sort by popularity or funding. Donate using crypto on the Stellar blockchain.',
	openGraph: {
		title: 'Projects | KindFi',
		description:
			'Discover impactful crowdfunding campaigns across social and environmental causes. Donate securely using Stellar blockchain.',
		type: 'website',
		url: '/projects',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Projects | KindFi',
		description: 'Explore and support transparent crowdfunding projects on KindFi.',
	},
	alternates: {
		canonical: '/projects',
	},
}

export default async function ProjectsPage({
	searchParams,
}: {
	searchParams: Promise<{ sort?: string; category?: string | string[] }>
}) {
	const queryClient = new QueryClient()

	const { sort, category } = await searchParams
	const sortSlug = sort ?? 'most-popular'
	const categorySlugs = Array.isArray(category) ? category : category ? [category] : []
	const viewerLocale = await getViewerLocale()

	const categoryKey = categorySlugs.join(',')

	await Promise.all([
		/**
		 * Prefetch the first page of projects using the same query key shape as
		 * `usePaginatedProjects` so the client hydrates correctly without a
		 * second round-trip.
		 */
		(async () => {
			const supabase = await createSupabaseServerClient()
			await queryClient.prefetchInfiniteQuery({
				queryKey: [
					'projects-paginated',
					categoryKey,
					sortSlug,
					viewerLocale,
					PROJECTS_PAGE_SIZE,
				] as const,
				queryFn: async ({ pageParam = 0 }) => {
					return getAllProjects(
						supabase,
						categorySlugs,
						sortSlug,
						PROJECTS_PAGE_SIZE,
						{ viewerLocale },
						pageParam as number,
					)
				},
				initialPageParam: 0,
				getNextPageParam: (lastPage) => {
					const page = lastPage as { nextOffset: number | null }
					return page.nextOffset ?? undefined
				},
				pages: 1, // Only prefetch the first page on the server
			})
		})(),
		prefetchSupabaseQuery(queryClient, 'categories', getAllCategories),
	])

	const dehydratedState = dehydrate(queryClient)

	return (
		<>
			<JsonLd
				data={getBreadcrumbSchema([
					{ name: 'Home', url: '/' },
					{ name: 'Projects', url: '/projects' },
				])}
			/>
			<HydrationBoundary state={dehydratedState}>
				<ProjectsHero categorySlugs={categorySlugs} sortSlug={sortSlug} />
				<ProjectsClientWrapper />
			</HydrationBoundary>
		</>
	)
}
