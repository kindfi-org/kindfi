import { ChevronLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { NewsCard } from '~/components/cards/news-card'
import { SectionContainer } from '~/components/shared/section-container'
import { readAllPosts } from '~/lib/mdx'
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
	}
}

export default async function CategoryPage({ params }: PageProps) {
	const { category } = await params
	const decoded = decodeURIComponent(category)
	const posts = readAllPosts().filter((p) => (p.category ?? 'general') === decoded)
	if (posts.length === 0) return notFound()

	const headingId = 'news-category-heading'
	const label = formatNewsCategoryLabel(decoded)

	return (
		<main className="min-h-screen bg-muted/30" aria-label={`News in category: ${label}`}>
			<SectionContainer maxWidth="6xl" className="py-10 sm:py-14 lg:py-16">
				<Link
					href="/news"
					className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
				>
					<ChevronLeft className="h-4 w-4" aria-hidden />
					All news
				</Link>

				<header className="mb-10 border-b border-border pb-8 sm:mb-12 sm:pb-10">
					<h1
						id={headingId}
						className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
					>
						<span className="gradient-text">{label}</span>
					</h1>
					<p className="mt-2 max-w-2xl text-muted-foreground">
						{posts.length} {posts.length === 1 ? 'article' : 'articles'} in this category.
					</p>
				</header>

				<section
					aria-labelledby={headingId}
					className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
				>
					{posts.map((post, index) => (
						<NewsCard
							key={post.slug}
							update={mapPostToNewsUpdate(post, index)}
							showCategory={false}
						/>
					))}
				</section>
			</SectionContainer>
		</main>
	)
}
