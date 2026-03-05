import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
	createSupabaseServerClient,
	prefetchSupabaseQuery,
} from '@packages/lib/supabase-server'
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from '@tanstack/react-query'
import { ProjectClientWrapper } from '~/components/sections/projects/detail/project-client-wrapper'
import { getProjectBySlug } from '~/lib/queries/projects'
import { validateProjectSlug } from '~/lib/validation/project-slug'

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>
}): Promise<Metadata> {
	const { slug } = await params
	if (!validateProjectSlug(slug)) return { title: 'Project | KindFi' }
	const client = await createSupabaseServerClient()
	const project = await getProjectBySlug(client, slug)
	if (!project) return { title: 'Project | KindFi' }
	return {
		title: `${project.title} | KindFi`,
		description: project.description ?? undefined,
		openGraph: {
			title: project.title,
			description: project.description ?? undefined,
			images: project.image ? [project.image] : undefined,
		},
	}
}

export default async function ProjectDetailPage({
	params,
}: {
	params: Promise<{
		slug: string
	}>
}) {
	const { slug } = await params
	if (!validateProjectSlug(slug)) notFound()

	const queryClient = new QueryClient()

	// Prefetch single project data
	await prefetchSupabaseQuery(
		queryClient,
		'project',
		(client) => getProjectBySlug(client, slug),
		[slug],
	)

	// Hydrate React Query cache on the client
	const dehydratedState = dehydrate(queryClient)

	return (
		<main
			className="container mx-auto p-4 md:p-12"
			aria-label="Project details"
		>
			<HydrationBoundary state={dehydratedState}>
				<ProjectClientWrapper projectSlug={slug} />
			</HydrationBoundary>
		</main>
	)
}
