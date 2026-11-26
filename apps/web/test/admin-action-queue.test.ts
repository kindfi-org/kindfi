import { describe, expect, test } from 'bun:test'
import { getProjectPrimaryAction } from '~/lib/admin/project-actions'
import { daysWaiting, deriveQueuePriority } from '~/lib/queries/admin/get-action-queues'

const NOW = new Date('2026-08-24T12:00:00Z')

const daysAgo = (days: number) => new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString()

describe('daysWaiting', () => {
	test('computes fractional days since the timestamp', () => {
		expect(daysWaiting(daysAgo(2), NOW)).toBeCloseTo(2)
		expect(daysWaiting(daysAgo(0.5), NOW)).toBeCloseTo(0.5)
	})

	test('handles null and invalid timestamps as zero', () => {
		expect(daysWaiting(null, NOW)).toBe(0)
		expect(daysWaiting('not-a-date', NOW)).toBe(0)
	})

	test('never returns negative values for future timestamps', () => {
		expect(daysWaiting(daysAgo(-3), NOW)).toBe(0)
	})
})

describe('deriveQueuePriority', () => {
	test('escrow attention and missing escrows are always high', () => {
		expect(deriveQueuePriority('escrow_attention', 0)).toBe('high')
		expect(deriveQueuePriority('missing_escrows', 0)).toBe('high')
	})

	test('project reviews escalate with waiting time', () => {
		expect(deriveQueuePriority('project_reviews', 0)).toBe('low')
		expect(deriveQueuePriority('project_reviews', 1.5)).toBe('medium')
		expect(deriveQueuePriority('project_reviews', 4)).toBe('high')
	})

	test('milestone reviews start medium and escalate', () => {
		expect(deriveQueuePriority('milestone_reviews', 0)).toBe('medium')
		expect(deriveQueuePriority('milestone_reviews', 3)).toBe('high')
	})

	test('kyc cases escalate after three days', () => {
		expect(deriveQueuePriority('kyc_cases', 1)).toBe('medium')
		expect(deriveQueuePriority('kyc_cases', 3)).toBe('high')
	})

	test('informational queues stay low', () => {
		expect(deriveQueuePriority('new_users', 30)).toBe('low')
		expect(deriveQueuePriority('stale_drafts', 30)).toBe('low')
	})
})

describe('getProjectPrimaryAction', () => {
	test('routes review projects to the manage workspace', () => {
		const action = getProjectPrimaryAction({
			status: 'review',
			slug: 'save-the-bees',
			hasEscrow: false,
		})
		expect(action.label).toBe('Review project')
		expect(action.href).toBe('/projects/save-the-bees/manage')
	})

	test('routes active projects without escrow to escrow setup', () => {
		const action = getProjectPrimaryAction({
			status: 'active',
			slug: 'save-the-bees',
			hasEscrow: false,
		})
		expect(action.label).toBe('Create escrow')
		expect(action.href).toBe('/projects/save-the-bees/manage/settings')
	})

	test('routes active projects with escrow to escrow ops', () => {
		const action = getProjectPrimaryAction({
			status: 'active',
			slug: 'save-the-bees',
			hasEscrow: true,
		})
		expect(action.label).toBe('Manage escrow')
		expect(action.href).toBe('/projects/save-the-bees/manage/settings/manage')
	})

	test('routes funded projects to the public campaign page', () => {
		const action = getProjectPrimaryAction({
			status: 'funded',
			slug: 'save-the-bees',
			hasEscrow: true,
		})
		expect(action.label).toBe('View campaign')
		expect(action.href).toBe('/projects/save-the-bees')
	})
})
