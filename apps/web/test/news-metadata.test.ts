import { describe, expect, test } from 'bun:test'
import { getNewsArticleUrl } from '~/lib/seo/news-metadata'
import { SITE_URL } from '~/lib/seo/structured-data'

describe('getNewsArticleUrl', () => {
	test('builds an absolute news article URL from SITE_URL', () => {
		expect(getNewsArticleUrl('venezuela-earthquake-emergency-relief-launch')).toBe(
			`${SITE_URL}/news/venezuela-earthquake-emergency-relief-launch`,
		)
	})

	test('does not use localhost when SITE_URL is configured for production', () => {
		expect(SITE_URL).not.toBe('http://localhost:3000')
		expect(getNewsArticleUrl('sample-post')).toMatch(/^https:\/\//)
	})
})
