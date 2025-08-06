import { prefetchSupabaseQuery } from '@packages/lib/supabase/server'
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from '@tanstack/react-query'
import { UpdateProjectWrapper } from '~/components/sections/projects/create/update-project-wrapper'
import { getBasicProjectInfoBySlug } from '~/lib/queries/projects/get-basic-project-info-by-slug'

export default async function UpdateProjectPage({
	params,
}: {
	params: Promise<{
		slug: string
	}>
}) {
	const { slug } = await params

	const queryClient = new QueryClient()

	// Prefetch basic project info
	await prefetchSupabaseQuery(
		queryClient,
		'basic-project-info',
		(client) => getBasicProjectInfoBySlug(client, slug),
		[slug],
	)

	// Hydrate React Query cache on the client
	const dehydratedState = dehydrate(queryClient)

	return (
		<main className="container mx-auto px-4 py-8 md:py-12">
			<HydrationBoundary state={dehydratedState}>
				<UpdateProjectWrapper projectSlug={slug} />
			</HydrationBoundary>
		</main>
	)
}
