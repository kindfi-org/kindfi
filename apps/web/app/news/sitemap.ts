import type { MetadataRoute } from 'next'
import { readAllPosts } from '~/lib/mdx'
import { SITE_URL } from '~/lib/seo/structured-data'

export default function sitemap(): MetadataRoute.Sitemap {
	const posts = readAllPosts()
	return posts.map((post) => ({
		url: `${SITE_URL}/news/${post.slug}`,
		lastModified: new Date(post.updated || post.date),
		changeFrequency: 'weekly' as const,
		priority: 0.7,
	}))
}
