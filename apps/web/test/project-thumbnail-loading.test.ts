import { describe, expect, test } from 'bun:test'
import {
	DEFAULT_PROJECT_THUMBNAIL_LOADING,
	projectThumbnailLoadingForIndex,
	resolveProjectThumbnailImageProps,
} from '~/lib/projects/project-thumbnail-loading'

describe('project card thumbnail loading policy', () => {
	test('an omitted policy does not preload the card image', () => {
		expect(DEFAULT_PROJECT_THUMBNAIL_LOADING).toBe('lazy')
		expect(resolveProjectThumbnailImageProps()).toEqual({
			loading: 'lazy',
			fetchPriority: 'auto',
		})
		expect(resolveProjectThumbnailImageProps().preload).toBeUndefined()
		expect(resolveProjectThumbnailImageProps('lazy').preload).toBeUndefined()
	})

	test('the deprecated priority prop is never emitted', () => {
		for (const loading of ['lazy', 'eager', 'preload'] as const) {
			expect(resolveProjectThumbnailImageProps(loading)).not.toHaveProperty('priority')
		}
	})

	test('only an explicit policy preloads', () => {
		expect(resolveProjectThumbnailImageProps('preload')).toEqual({ preload: true })
		expect(resolveProjectThumbnailImageProps('eager')).toEqual({
			loading: 'eager',
			fetchPriority: 'high',
		})
	})

	test('a below-hero listing card never preloads', () => {
		for (const index of [1, 2, 3, 6, 42]) {
			expect(projectThumbnailLoadingForIndex(index)).toBe('lazy')
		}
	})

	test('only the first visible row card of the paginated grid loads eagerly', () => {
		expect(projectThumbnailLoadingForIndex(0)).toBe('eager')
	})

	test('invalid indexes fall back to the lazy default', () => {
		expect(projectThumbnailLoadingForIndex(-1)).toBe('lazy')
		expect(projectThumbnailLoadingForIndex(1.5)).toBe('lazy')
		expect(projectThumbnailLoadingForIndex(Number.NaN)).toBe('lazy')
	})
})
