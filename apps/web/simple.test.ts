import { describe, expect, test } from 'bun:test'
import { z } from 'zod'

describe('Simple test', () => {
	test('should work with zod', () => {
		const schema = z.string()
		const result = schema.safeParse('hello')
		expect(result.success).toBe(true)
	})
})
