import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NewsSubpageShell } from '~/components/sections/news/news-subpage-shell'
import { JsonLd } from '~/components/shared/json-ld'
import { readAllPosts } from '~/lib/mdx'
import { getBreadcrumbSchema } from '~/lib/seo/structured-data'
import { mapPostToNewsUpdate } from '~/lib/utils/news'

export const revalidate = 3600

interface PageProps {
	params: Promise<{ tag: string }>
}

export function generateStaticParams() {
	const tags = Array.from(new Set(readAllPosts().flatMap((p) => p.tags ?? [])))
	return tags.map((tag) => ({ tag }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { tag } = await params
	const decoded = decodeURIComponent(tag)
	return {
		title: `#${decoded} | News | KindFi`,
		description: `KindFi news and updates tagged with "${decoded}".`,
		alternates: {
			canonical: `/news/tag/${tag}`,
		},
	}
}

export default async function TagPage({ params }: PageProps) {
	const { tag } = await params
	const decoded = decodeURIComponent(tag)
	const posts = readAllPosts().filter((p) => (p.tags ?? []).includes(decoded))
	if (posts.length === 0) return notFound()

	const headingId = 'news-tag-heading'
	const articles = posts.map((post, index) => mapPostToNewsUpdate(post, index))

	return (
		<>
			<JsonLd
				data={getBreadcrumbSchema([
					{ name: 'Home', url: '/' },
					{ name: 'News', url: '/news' },
					{ name: `#${decoded}`, url: `/news/tag/${tag}` },
				])}
			/>
			<NewsSubpageShell
				headingId={headingId}
				title={
					<>
						<span className="text-slate-400">#</span>
						<span className="gradient-text">{decoded}</span>
					</>
				}
				articles={articles}
				showCategory
				variant="tag"
			/>
		</>
	)
}
