import type { MetadataRoute } from 'next'
import { readAllPosts } from '~/lib/mdx'

export default function sitemap(): MetadataRoute.Sitemap {
	const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
	const posts = readAllPosts()
	return posts.map((post) => ({
		url: `${base}/news/${post.slug}`,
		lastModified: new Date(post.updated || post.date),
		changeFrequency: 'weekly' as const,
		priority: 0.7,
	}))
}
