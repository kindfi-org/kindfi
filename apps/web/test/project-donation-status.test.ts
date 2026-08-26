import { describe, expect, test } from 'bun:test'
import {
	isProjectAcceptingDonations,
	isProjectCampaignComplete,
	type ProjectStatus,
} from '~/lib/projects/project-status'

const ALL_STATUSES: ProjectStatus[] = ['draft', 'review', 'active', 'paused', 'funded', 'rejected']

describe('isProjectAcceptingDonations', () => {
	test('returns true only for active campaigns', () => {
		expect(isProjectAcceptingDonations('active')).toBe(true)
	})

	test('returns false for non-active campaign statuses', () => {
		for (const status of ALL_STATUSES) {
			if (status === 'active') continue
			expect(isProjectAcceptingDonations(status)).toBe(false)
		}
	})
})

describe('isProjectCampaignComplete', () => {
	test('returns true only for funded status', () => {
		expect(isProjectCampaignComplete('funded')).toBe(true)
	})

	test('returns false for non-funded campaign statuses', () => {
		for (const status of ALL_STATUSES) {
			if (status === 'funded') continue
			expect(isProjectCampaignComplete(status)).toBe(false)
		}
	})
})
