import type { MdxPost } from '~/lib/mdx'
import type { NewsUpdate } from '~/lib/types/learning.types'

const PLACEHOLDER_IMG = '/images/placeholder.png'

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
		image: post.image ?? PLACEHOLDER_IMG,
		date: post.date,
		category: post.category ?? 'news',
		tags: post.tags ?? [],
	}
}
