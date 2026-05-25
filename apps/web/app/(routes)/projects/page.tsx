import type { Metadata } from 'next'
import { prefetchSupabaseQuery } from '@packages/lib/supabase-server'
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from '@tanstack/react-query'
import { ProjectsClientWrapper } from '~/components/sections/projects/projects-client-wrapper'
import { ProjectsHero } from '~/components/sections/projects/projects-hero'
import { getAllCategories, getAllProjects } from '~/lib/queries/projects'

export const metadata: Metadata = {
	title: 'Projects | KindFi',
	description:
		'Explore and support transparent crowdfunding projects on KindFi. Filter by category, sort by popularity or funding.',
}

export default async function ProjectsPage({
	searchParams,
}: {
	searchParams: Promise<{ sort?: string; category?: string | string[] }>
}) {
	const queryClient = new QueryClient()

	const { sort, category } = await searchParams
	const sortSlug = sort ?? 'most-popular'
	const categorySlugs = Array.isArray(category)
		? category
		: category
			? [category]
			: []

	await Promise.all([
		prefetchSupabaseQuery(
			queryClient,
			'projects',
			(client) => getAllProjects(client, categorySlugs, sortSlug),
			[categorySlugs, sortSlug],
		),
		prefetchSupabaseQuery(queryClient, 'categories', getAllCategories),
	])

	const dehydratedState = dehydrate(queryClient)

	return (
		<HydrationBoundary state={dehydratedState}>
			<ProjectsHero categorySlugs={categorySlugs} sortSlug={sortSlug} />
			<ProjectsClientWrapper />
		</HydrationBoundary>
	)
}
