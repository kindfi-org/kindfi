
import { prefetchSupabaseQuery } from '@packages/lib/supabase-server'
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from '@tanstack/react-query'
import { ProjectsClientWrapper } from '~/components/sections/projects/projects-client-wrapper'
import { ProjectsHeader } from '~/components/sections/projects/projects-header'
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
			<ProjectsHeader />

			<HydrationBoundary state={dehydratedState}>
				<ProjectsClientWrapper />
			</HydrationBoundary>
		</main>
	)
}
