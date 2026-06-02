import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NewsSubpageShell } from '~/components/sections/news/news-subpage-shell'
import { JsonLd } from '~/components/shared/json-ld'
import { readAllPosts } from '~/lib/mdx'
import { getBreadcrumbSchema } from '~/lib/seo/structured-data'
import { formatNewsCategoryLabel, mapPostToNewsUpdate } from '~/lib/utils/news'

export const revalidate = 3600

interface PageProps {
	params: Promise<{ category: string }>
}

export function generateStaticParams() {
	const categories = Array.from(
		new Set(
			readAllPosts()
				.map((p) => p.category)
				.filter(Boolean) as string[],
		),
	)
	return categories.map((category) => ({ category }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { category } = await params
	const label = formatNewsCategoryLabel(decodeURIComponent(category))
	return {
		title: `${label} | News | KindFi`,
		description: `KindFi news and updates in ${label}.`,
		alternates: {
			canonical: `/news/category/${category}`,
		},
	}
}

export default async function CategoryPage({ params }: PageProps) {
	const { category } = await params
	const decoded = decodeURIComponent(category)
	const posts = readAllPosts().filter((p) => (p.category ?? 'general') === decoded)
	if (posts.length === 0) return notFound()

	const headingId = 'news-category-heading'
	const label = formatNewsCategoryLabel(decoded)
	const articles = posts.map((post, index) => mapPostToNewsUpdate(post, index))

	return (
		<>
			<JsonLd
				data={getBreadcrumbSchema([
					{ name: 'Home', url: '/' },
					{ name: 'News', url: '/news' },
					{ name: label, url: `/news/category/${category}` },
				])}
			/>
			<NewsSubpageShell
				headingId={headingId}
				title={<span className="gradient-text">{label}</span>}
				articles={articles}
				showCategory={false}
				variant="category"
			/>
		</>
	)
}
