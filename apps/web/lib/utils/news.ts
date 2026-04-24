import type { MdxPost } from '~/lib/mdx'
import type { NewsUpdate } from '~/lib/types/learning.types'

/** Human-readable label for URL slug categories (e.g. `product-update` → `Product update`). */
export function formatNewsCategoryLabel(category: string): string {
	return category
		.split(/[-_]/g)
		.filter(Boolean)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ')
}

/**
 * Maps an MDX post to the shape expected by NewsCard.
 * Single place for the adapter so category/tag/index pages stay DRY.
 */
export function mapPostToNewsUpdate(post: MdxPost, id = 0): NewsUpdate {
	return {
		id,
		slug: post.slug,
		title: post.title,
		description: post.description,
		...(post.image ? { image: post.image } : {}),
		date: post.date,
		category: post.category ?? 'news',
		tags: post.tags ?? [],
	}
}
