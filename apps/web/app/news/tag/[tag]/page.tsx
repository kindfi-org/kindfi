import { ChevronLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { NewsCard } from '~/components/cards/news-card'
import { SectionContainer } from '~/components/shared/section-container'
import { readAllPosts } from '~/lib/mdx'
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
	}
}

export default async function TagPage({ params }: PageProps) {
	const { tag } = await params
	const decoded = decodeURIComponent(tag)
	const posts = readAllPosts().filter((p) => (p.tags ?? []).includes(decoded))
	if (posts.length === 0) return notFound()

	const headingId = 'news-tag-heading'

	return (
		<main className="min-h-screen bg-muted/30" aria-label={`News tagged with ${decoded}`}>
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
						<span className="text-muted-foreground">#</span>
						<span className="gradient-text">{decoded}</span>
					</h1>
					<p className="mt-2 max-w-2xl text-muted-foreground">
						{posts.length} {posts.length === 1 ? 'article' : 'articles'} with this tag.
					</p>
				</header>

				<section
					aria-labelledby={headingId}
					className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
				>
					{posts.map((post, index) => (
						<NewsCard key={post.slug} update={mapPostToNewsUpdate(post, index)} showCategory />
					))}
				</section>
			</SectionContainer>
		</main>
	)
}
