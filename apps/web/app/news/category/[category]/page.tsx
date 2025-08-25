import { notFound } from 'next/navigation'
import { NewsCard } from '~/components/cards/news-card'
import { readAllPosts } from '~/lib/mdx'

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

export default async function CategoryPage({ params }: PageProps) {
	const { category } = await params
	const posts = readAllPosts().filter(
		(p) => (p.category || 'general') === category,
	)
	if (posts.length === 0) return notFound()

	return (
		<div className="container mx-auto py-10">
			<h1 className="text-3xl font-bold mb-6 capitalize">
				Category: {category}
			</h1>
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
