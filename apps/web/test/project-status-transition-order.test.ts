import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'

/**
 * Issue #1024: the KYC authorization check must run after the project row is read
 * and the status transition is validated, so an impossible transition is never
 * answered with a KYC denial.
 *
 * The ordering is asserted against the route source rather than by invoking the
 * handler. `bun`'s `mock.module` is process-global, so importing this route with
 * its NextAuth, Supabase, and KYC dependencies mocked changes the outcome of
 * unrelated test files. The ordering is the entire fix, so the source is a
 * faithful and side-effect-free oracle for it.
 */
const ROUTE = new URL('../app/api/projects/[slug]/manage/status/route.ts', import.meta.url)
const source = readFileSync(ROUTE, 'utf8')

const at = (needle: string): number => {
	const index = source.indexOf(needle)
	expect(index).toBeGreaterThan(-1)
	return index
}

describe('manage/status route — transition validation before KYC authorization', () => {
	test('reads the stored project status before running the KYC check', () => {
		// The first `from('projects')` is the status lookup; the second is the update.
		const projectRead = at("from('projects')")
		const kycCheck = at('requireKycAuthorization({')

		expect(projectRead).toBeLessThan(kycCheck)
	})

	test('validates the transition before running the KYC check', () => {
		const transitionCheck = at('isAllowedStatusTransition({')
		const kycCheck = at('requireKycAuthorization({')

		expect(transitionCheck).toBeLessThan(kycCheck)
	})

	test('answers an invalid transition before the KYC check can deny it', () => {
		const invalidTransitionResponse = at(
			'You can only mark a draft or rejected project as ready for review',
		)
		const kycCheck = at('requireKycAuthorization({')

		expect(invalidTransitionResponse).toBeLessThan(kycCheck)
	})

	test('keeps the manager-only guard and KYC action on the moved check', () => {
		const kycCheck = at('requireKycAuthorization({')
		const guard = source.lastIndexOf(
			"if (!auth.access.isPlatformAdmin && nextStatus === 'review') {",
			kycCheck,
		)

		expect(guard).toBeGreaterThan(-1)
		expect(guard).toBeLessThan(kycCheck)
		expect(source.slice(kycCheck)).toContain("action: 'submit_campaign'")
	})
})
