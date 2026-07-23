import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { cache } from 'react'
import { ProjectClientWrapper } from '~/components/sections/projects/detail/project-client-wrapper'
import { JsonLd } from '~/components/shared/json-ld'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { getViewerLocale } from '~/lib/i18n/locale-cookie.server'
import { resolveProjectBySlug } from '~/lib/queries/projects/resolve-project-by-slug'
import { buildProjectMetadata, getProjectPageUrl } from '~/lib/seo/project-metadata'
import { getBreadcrumbSchema, SITE_URL } from '~/lib/seo/structured-data'
import { validateProjectSlug } from '~/lib/validation/project-slug'

const getProjectBySlugCached = cache(async (slug: string) => {
	const session = await getServerSession(nextAuthOption)
	const viewerLocale = await getViewerLocale()
	return resolveProjectBySlug(slug, session?.user?.id, { viewerLocale })
})

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>
}): Promise<Metadata> {
	const { slug } = await params
	if (!validateProjectSlug(slug)) return { title: 'Project | KindFi' }
	const project = await getProjectBySlugCached(slug)
	if (!project) return { title: 'Project | KindFi' }

	return buildProjectMetadata({
		slug,
		title: project.title,
		description: project.description,
		image: project.image,
		categoryName: project.category?.name ?? null,
		tagNames: project.tags?.map((tag) => tag.name) ?? [],
	})
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

	const project = await getProjectBySlugCached(slug)

	if (!project) notFound()

	const queryClient = new QueryClient()
	queryClient.setQueryData(['project', slug], project)

	const dehydratedState = dehydrate(queryClient)

	const projectPageUrl = getProjectPageUrl(slug)
	const projectSchema = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: project.title,
		description: project.description ?? undefined,
		url: projectPageUrl,
		primaryImageOfPage: project.image
			? {
					'@type': 'ImageObject',
					url: project.image,
				}
			: undefined,
		isPartOf: {
			'@type': 'WebSite',
			name: 'KindFi',
			url: SITE_URL,
		},
		about: {
			'@type': 'CreativeWork',
			name: project.title,
			description: project.description ?? undefined,
			url: projectPageUrl,
		},
	}

	return (
		<>
			<JsonLd
				data={getBreadcrumbSchema([
					{ name: 'Home', url: '/' },
					{ name: 'Projects', url: '/projects' },
					{ name: project?.title ?? slug, url: `/projects/${slug}` },
				])}
			/>
			<JsonLd data={projectSchema} />
			<main className="container mx-auto p-4 md:p-12" aria-label="Project details">
				<HydrationBoundary state={dehydratedState}>
					<ProjectClientWrapper projectSlug={slug} />
				</HydrationBoundary>
			</main>
		</>
	)
}
