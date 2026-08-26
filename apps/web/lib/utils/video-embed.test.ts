import { describe, expect, it } from 'bun:test'
import {
	extractVideoId,
	getVideoProvider,
	isSupportedVideoUrl,
	transformToEmbedUrl,
} from './video-embed'

describe('video-embed', () => {
	describe('getVideoProvider', () => {
		it('detects youtube hosts', () => {
			expect(getVideoProvider('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('youtube')
			expect(getVideoProvider('https://youtu.be/dQw4w9WgXcQ')).toBe('youtube')
			expect(getVideoProvider('https://m.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('youtube')
		})

		it('detects vimeo and loom', () => {
			expect(getVideoProvider('https://vimeo.com/123456789')).toBe('vimeo')
			expect(getVideoProvider('https://player.vimeo.com/video/123456789')).toBe('vimeo')
			expect(getVideoProvider('https://www.loom.com/share/028e5c4fb5d14ce3af18c85f514355ec')).toBe(
				'loom',
			)
		})

		it('returns null for unsupported hosts', () => {
			expect(getVideoProvider('https://example.com/video')).toBeNull()
		})
	})

	describe('transformToEmbedUrl', () => {
		it('transforms youtube watch, short, and share links', () => {
			expect(transformToEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
				'https://www.youtube.com/embed/dQw4w9WgXcQ',
			)
			expect(transformToEmbedUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(
				'https://www.youtube.com/embed/dQw4w9WgXcQ',
			)
			expect(transformToEmbedUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe(
				'https://www.youtube.com/embed/dQw4w9WgXcQ',
			)
			expect(transformToEmbedUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe(
				'https://www.youtube.com/embed/dQw4w9WgXcQ',
			)
		})

		it('transforms vimeo urls', () => {
			expect(transformToEmbedUrl('https://vimeo.com/123456789')).toBe(
				'https://player.vimeo.com/video/123456789',
			)
			expect(transformToEmbedUrl('https://vimeo.com/channels/staffpicks/123456789')).toBe(
				'https://player.vimeo.com/video/123456789',
			)
		})

		it('transforms loom share urls', () => {
			expect(
				transformToEmbedUrl('https://www.loom.com/share/028e5c4fb5d14ce3af18c85f514355ec'),
			).toBe('https://www.loom.com/embed/028e5c4fb5d14ce3af18c85f514355ec')
		})
	})

	describe('isSupportedVideoUrl', () => {
		it('accepts supported https urls', () => {
			expect(isSupportedVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true)
			expect(isSupportedVideoUrl('https://vimeo.com/123456789')).toBe(true)
			expect(
				isSupportedVideoUrl('https://www.loom.com/share/028e5c4fb5d14ce3af18c85f514355ec'),
			).toBe(true)
		})

		it('rejects http and unknown providers', () => {
			expect(isSupportedVideoUrl('http://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(false)
			expect(isSupportedVideoUrl('https://example.com/video')).toBe(false)
		})
	})

	describe('extractVideoId', () => {
		it('extracts ids across providers', () => {
			expect(extractVideoId('https://www.youtube.com/live/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
			expect(extractVideoId('https://vimeo.com/manage/videos/987654321')).toBe('987654321')
			expect(extractVideoId('https://www.loom.com/embed/028e5c4fb5d14ce3af18c85f514355ec')).toBe(
				'028e5c4fb5d14ce3af18c85f514355ec',
			)
		})
	})
})
