import { describe, expect, it } from 'bun:test'
import {
	getDonationShareContent,
	getDonationShareDescription,
	getDonationShareTitle,
} from '../lib/seo/donation-share'

describe('donation share helpers', () => {
	it('builds a donor-first share title', () => {
		expect(getDonationShareTitle('Venezuela Earthquake Relief')).toBe(
			'I just supported Venezuela Earthquake Relief on KindFi — join me!',
		)
	})

	it('includes contribution amount in the description when provided', () => {
		const description = getDonationShareDescription({
			projectTitle: 'Venezuela Earthquake Relief',
			projectDescription: 'Emergency aid for affected communities.',
			contributionAmount: 50,
		})

		expect(description).toContain('I donated $50')
		expect(description).toContain('Venezuela Earthquake Relief')
	})

	it('links to the project page', () => {
		const content = getDonationShareContent({
			projectTitle: 'Venezuela Earthquake Relief',
			projectSlug: 'venezuela-earthquake-emergency-relief',
			contributionAmount: 25,
		})

		expect(content.url).toContain('/projects/venezuela-earthquake-emergency-relief')
		expect(content.title).toContain('join me')
	})
})
