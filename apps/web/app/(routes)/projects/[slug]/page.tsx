import {
	createSupabaseServerClient,
	prefetchSupabaseQuery,
} from '@packages/lib/supabase-server'
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from '@tanstack/react-query'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProjectClientWrapper } from '~/components/sections/projects/detail/project-client-wrapper'
import { JsonLd } from '~/components/shared/json-ld'
import { getProjectBySlug } from '~/lib/queries/projects'
import { getBreadcrumbSchema } from '~/lib/seo/structured-data'
import { validateProjectSlug } from '~/lib/validation/project-slug'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kindfi.org'

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
			type: 'website',
			url: `/projects/${slug}`,
			images: project.image
				? [{ url: project.image, alt: project.title }]
				: undefined,
		},
		twitter: {
			card: 'summary_large_image',
			title: project.title,
			description: project.description ?? undefined,
			images: project.image ? [project.image] : undefined,
		},
		alternates: {
			canonical: `/projects/${slug}`,
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
	const client = await createSupabaseServerClient()
	const project = await getProjectBySlug(client, slug)

	await prefetchSupabaseQuery(
		queryClient,
		'project',
		(c) => getProjectBySlug(c, slug),
		[slug],
	)

	const dehydratedState = dehydrate(queryClient)

	const projectSchema = project
		? {
				'@context': 'https://schema.org',
				'@type': 'Event',
				name: project.title,
				description: project.description ?? undefined,
				url: `${BASE_URL}/projects/${slug}`,
				image: project.image ?? undefined,
				organizer: {
					'@type': 'Organization',
					name: 'KindFi',
					url: BASE_URL,
				},
			}
		: null

	return (
		<>
			<JsonLd
				data={getBreadcrumbSchema([
					{ name: 'Home', url: '/' },
					{ name: 'Projects', url: '/projects' },
					{ name: project?.title ?? slug, url: `/projects/${slug}` },
				])}
			/>
			{projectSchema && <JsonLd data={projectSchema} />}
			<main
				className="container mx-auto p-4 md:p-12"
				aria-label="Project details"
			>
				<HydrationBoundary state={dehydratedState}>
					<ProjectClientWrapper projectSlug={slug} />
				</HydrationBoundary>
			</main>
		</>
	)
}
