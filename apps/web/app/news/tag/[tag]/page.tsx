import { notFound } from 'next/navigation'
import { NewsCard } from '~/components/cards/news-card'
import { readAllPosts } from '~/lib/mdx'

export const revalidate = 3600

interface PageProps {
	params: Promise<{ tag: string }>
}

export function generateStaticParams() {
	const tags = Array.from(new Set(readAllPosts().flatMap((p) => p.tags || [])))
	return tags.map((tag) => ({ tag }))
}

export default async function TagPage({ params }: PageProps) {
	const { tag } = await params
	const posts = readAllPosts().filter((p) => (p.tags || []).includes(tag))
	if (posts.length === 0) return notFound()

	return (
		<div className="container mx-auto py-10">
			<h1 className="text-3xl font-bold mb-6">Tag: #{tag}</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{posts.map((post) => (
					<NewsCard
						key={post.slug}
						update={{
							id: 0,
							slug: post.slug,
							title: post.title,
							description: post.description,
							image: post.image || '/images/placeholder.png',
							date: post.date,
							category: post.category || 'news',
							tags: post.tags || [],
						}}
					/>
				))}
			</div>
		</div>
	)
}
