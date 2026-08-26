import { describe, expect, test } from 'bun:test'
import { deriveProjectUpdateTitle } from '~/lib/utils/project-update-title'

describe('deriveProjectUpdateTitle', () => {
	test('uses explicit title when provided', () => {
		expect(deriveProjectUpdateTitle('Body content', 'Relief funds deployed')).toBe(
			'Relief funds deployed',
		)
	})

	test('derives title from first line of content', () => {
		expect(deriveProjectUpdateTitle('First milestone complete\nMore details here.')).toBe(
			'First milestone complete',
		)
	})

	test('truncates long titles', () => {
		const longLine = 'a'.repeat(120)
		expect(deriveProjectUpdateTitle(longLine).length).toBe(100)
		expect(deriveProjectUpdateTitle(longLine).endsWith('...')).toBe(true)
	})
})
