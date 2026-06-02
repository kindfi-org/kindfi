import type { MetadataRoute } from 'next'
import { readAllPosts } from '~/lib/mdx'
import { SITE_URL } from '~/lib/seo/structured-data'

type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

const STATIC_ROUTES: {
	path: string
	priority: number
	changeFrequency: ChangeFreq
}[] = [
	{ path: '', priority: 1, changeFrequency: 'daily' },
	{ path: '/about', priority: 0.9, changeFrequency: 'monthly' },
	{ path: '/projects', priority: 0.9, changeFrequency: 'daily' },
	{ path: '/news', priority: 0.8, changeFrequency: 'daily' },
	{ path: '/governance', priority: 0.8, changeFrequency: 'weekly' },
	{ path: '/faqs', priority: 0.7, changeFrequency: 'monthly' },
	{ path: '/foundations', priority: 0.8, changeFrequency: 'weekly' },
	{ path: '/impact', priority: 0.7, changeFrequency: 'weekly' },
	{ path: '/featured', priority: 0.7, changeFrequency: 'weekly' },
]

export default function sitemap(): MetadataRoute.Sitemap {
	const routes: MetadataRoute.Sitemap = STATIC_ROUTES.map(
		({ path, priority, changeFrequency }) => ({
			url: `${SITE_URL}${path}`,
			lastModified: new Date(),
			changeFrequency,
			priority,
		}),
	)

	const posts: MetadataRoute.Sitemap = readAllPosts().map((post) => ({
		url: `${SITE_URL}/news/${post.slug}`,
		lastModified: new Date(post.updated || post.date),
		changeFrequency: 'weekly' as const,
		priority: 0.7,
	}))

	return [...routes, ...posts]
}
