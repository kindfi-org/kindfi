import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NewsCard } from '~/components/cards/news-card'
import { SectionContainer } from '~/components/shared/section-container'
import { readAllPosts } from '~/lib/mdx'
import { mapPostToNewsUpdate } from '~/lib/utils/news'

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
	return {
		title: `${category} | News | KindFi`,
		description: `KindFi news and updates in ${category}.`,
	}
}

export default async function CategoryPage({ params }: PageProps) {
	const { category } = await params
	const posts = readAllPosts().filter(
		(p) => (p.category ?? 'general') === category,
	)
	if (posts.length === 0) return notFound()

	const headingId = 'news-category-heading'

	return (
		<main
			className="min-h-screen bg-neutral-50/50 py-10 sm:py-14 lg:py-16"
			aria-label={`News in category: ${category}`}
		>
			<SectionContainer maxWidth="7xl">
				<h1
					id={headingId}
					className="text-3xl font-bold tracking-tight mb-8 capitalize sm:text-4xl text-gray-900 border-l-4 border-emerald-800 pl-4"
				>
					Category: {category}
				</h1>
				<section
					aria-labelledby={headingId}
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
				>
					{posts.map((post) => (
						<NewsCard key={post.slug} update={mapPostToNewsUpdate(post)} />
					))}
				</section>
			</SectionContainer>
		</main>
	)
}
