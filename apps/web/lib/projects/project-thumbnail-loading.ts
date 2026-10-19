/**
 * Page-owned loading policy for project card thumbnails.
 *
 * Cards used to derive `priority` from their index, which meant any caller that
 * omitted the index preloaded its image. Pages now state the policy explicitly
 * and `lazy` is the default, so nothing is scheduled ahead of the browser.
 */

export type ProjectThumbnailLoading = 'lazy' | 'eager' | 'preload'

export const DEFAULT_PROJECT_THUMBNAIL_LOADING: ProjectThumbnailLoading = 'lazy'

export interface ProjectThumbnailImageProps {
	loading?: 'lazy' | 'eager'
	preload?: boolean
	fetchPriority?: 'high' | 'auto'
}

/**
 * Map a policy onto the Next.js 16 `next/image` API. `priority` is deprecated in
 * favour of `preload`, and `preload` must not be combined with `loading` or
 * `fetchPriority`, so the preloaded case returns only `preload`.
 */
export function resolveProjectThumbnailImageProps(
	loading: ProjectThumbnailLoading = DEFAULT_PROJECT_THUMBNAIL_LOADING,
): ProjectThumbnailImageProps {
	if (loading === 'preload') {
		return { preload: true }
	}
	if (loading === 'eager') {
		return { loading: 'eager', fetchPriority: 'high' }
	}
	return { loading: 'lazy', fetchPriority: 'auto' }
}

/**
 * Policy for a card in a paginated project listing. Only the card that is
 * guaranteed visible on every viewport loads eagerly; the rest of the first row
 * stays lazy because the desktop grid pushes them beside, not above, the fold.
 * No listing card preloads: both `/projects` and the home carousel render a text
 * hero above the cards, so no card has been named as the LCP element. That makes
 * preloading unjustified until a trace identifies a viewport where a thumbnail
 * is the largest contentful paint; see `docs/project-thumbnail-loading.md`.
 */
export function projectThumbnailLoadingForIndex(index: number): ProjectThumbnailLoading {
	if (index !== Math.trunc(index) || index < 0) {
		return DEFAULT_PROJECT_THUMBNAIL_LOADING
	}
	return index === 0 ? 'eager' : 'lazy'
}
