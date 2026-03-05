import type { Metadata } from 'next'
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
	return {
		title: `#${tag} | News | KindFi`,
		description: `KindFi news and updates tagged with ${tag}.`,
	}
}

export default async function TagPage({ params }: PageProps) {
	const { tag } = await params
	const posts = readAllPosts().filter((p) => (p.tags ?? []).includes(tag))
	if (posts.length === 0) return notFound()

	const headingId = 'news-tag-heading'

	return (
		<main
			className="min-h-screen bg-neutral-50/50 py-10 sm:py-14 lg:py-16"
			aria-label={`News tagged with ${tag}`}
		>
			<SectionContainer maxWidth="7xl">
				<h1
					id={headingId}
					className="text-3xl font-bold tracking-tight mb-8 sm:text-4xl text-gray-900 border-l-4 border-emerald-800 pl-4"
				>
					Tag: #{tag}
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
