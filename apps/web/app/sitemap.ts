import type { MetadataRoute } from 'next'
import { readAllPosts } from '~/lib/mdx'

export default function sitemap(): MetadataRoute.Sitemap {
	const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
	const routes: MetadataRoute.Sitemap = [
		'',
		'/about',
		'/impact',
		'/featured',
		'/projects',
		'/news',
	].map((route) => ({
		url: `${base}${route}`,
		lastModified: new Date(),
		changeFrequency: 'weekly' as const,
		priority: route === '' ? 1 : 0.8,
	}))
	const posts: MetadataRoute.Sitemap = readAllPosts().map((post) => ({
		url: `${base}/news/${post.slug}`,
		lastModified: new Date(post.updated || post.date),
		changeFrequency: 'weekly' as const,
		priority: 0.7,
	}))
	return [...routes, ...posts]
}
