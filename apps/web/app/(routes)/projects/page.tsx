import {
	HydrationBoundary,
	QueryClient,
	dehydrate,
} from '@tanstack/react-query'

import { prefetchSupabaseQuery } from '@packages/lib/supabase/server'
import { ProjectsClientWrapper } from '~/components/sections/projects/projects-client-wrapper'
import { getAllProjects } from '~/lib/queries/projects'

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

	// Prefetch project data from Supabase (includes categories and tags)
	await prefetchSupabaseQuery(
		queryClient,
		'projects',
		(client) => getAllProjects(client, categorySlugs, sortSlug),
		[categorySlugs, sortSlug],
	)

	// Hydrate React Query cache on the client
	const dehydratedState = dehydrate(queryClient)

	return (
		<main className="container mx-auto p-4 md:p-12">
			<div className="mb-6">
				<h1 className="text-4xl md:text-5xl font-bold mb-4 py-2 sm:text-center gradient-text">
					Causes that change lives
				</h1>
				<p className="text-lg md:text-xl text-muted-foreground md:text-center">
					KindFi brings together projects driven by people committed to making
					the world better. With your support, every idea can become a concrete
					solution with lasting impact.
				</p>
			</div>

			<HydrationBoundary state={dehydratedState}>
				<ProjectsClientWrapper />
			</HydrationBoundary>
		</main>
	)
}
