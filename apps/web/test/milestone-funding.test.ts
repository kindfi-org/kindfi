import { describe, expect, test } from 'bun:test'
import {
	calculateReleasedAmount,
	calculateReleasedProgressPercent,
} from '~/lib/utils/projects/milestone-funding'

describe('calculateReleasedAmount', () => {
	test('sums only milestones with released status', () => {
		const milestones = [
			{ amount: 100, status: 'released' },
			{ amount: 50, status: 'approved' },
			{ amount: 25, status: 'pending' },
			{ amount: 30, status: 'released' },
		]
		expect(calculateReleasedAmount(milestones)).toBe(130)
	})

	test('returns 0 when no milestone is released', () => {
		const milestones = [
			{ amount: 100, status: 'approved' },
			{ amount: 50, status: 'disputed' },
		]
		expect(calculateReleasedAmount(milestones)).toBe(0)
	})

	test('coerces string amounts from the database', () => {
		const milestones = [
			{ amount: '100.5', status: 'released' },
			{ amount: '9.5', status: 'released' },
		]
		expect(calculateReleasedAmount(milestones)).toBe(110)
	})

	test('returns 0 for empty, null, or undefined input', () => {
		expect(calculateReleasedAmount([])).toBe(0)
		expect(calculateReleasedAmount(null)).toBe(0)
		expect(calculateReleasedAmount(undefined)).toBe(0)
	})

	test('ignores null/undefined amounts on released milestones', () => {
		const milestones = [
			{ amount: null, status: 'released' },
			{ amount: 40, status: 'released' },
		]
		expect(calculateReleasedAmount(milestones)).toBe(40)
	})
})

describe('calculateReleasedProgressPercent', () => {
	test('computes percentage of goal, rounded and clamped to 100', () => {
		expect(calculateReleasedProgressPercent(50, 200)).toBe(25)
		expect(calculateReleasedProgressPercent(300, 200)).toBe(100)
	})

	test('returns null when goal is missing or non-positive', () => {
		expect(calculateReleasedProgressPercent(50, 0)).toBeNull()
		expect(calculateReleasedProgressPercent(50, null)).toBeNull()
		expect(calculateReleasedProgressPercent(50, undefined)).toBeNull()
	})
})
