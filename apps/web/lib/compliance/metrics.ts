import { logger } from '@/lib/logger'
import { getComplianceSchemaClient } from './supabase-compliance-client'

export interface ComplianceMetrics {
	hypotheticalRestrictedCount: number
	actualRestrictedCount: number
	mismatchCount: number
	manualReviewCount: number
	activeExceptionCount: number
	expiringExceptionCount: number
}

/**
 * Minimal, query-backed aggregate view. Not a full BI dashboard by design —
 * counts recent audit_log rows rather than maintaining rollup tables.
 */
export async function getComplianceMetrics(sinceDays = 30): Promise<ComplianceMetrics> {
	const client = getComplianceSchemaClient()
	const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000).toISOString()
	const soon = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
	const now = new Date().toISOString()

	const [hypothetical, actual, mismatches, manualReview, activeExceptions, expiringExceptions] =
		await Promise.all([
			client
				.from('audit_log')
				.select('id', { count: 'exact', head: true })
				.eq('event_type', 'authorization_decision')
				.eq('hypothetical_allowed', false)
				.gte('created_at', since),
			client
				.from('audit_log')
				.select('id', { count: 'exact', head: true })
				.eq('event_type', 'authorization_decision')
				.eq('decision_allowed', false)
				.gte('created_at', since),
			client
				.from('country_declarations')
				.select('user_id', { count: 'exact', head: true })
				.eq('verification_status', 'mismatched'),
			client
				.from('audit_log')
				.select('id', { count: 'exact', head: true })
				.eq('reason_code', 'mismatch_manual_review')
				.gte('created_at', since),
			client
				.from('exceptions')
				.select('id', { count: 'exact', head: true })
				.is('revoked_at', null)
				.gt('expires_at', now),
			client
				.from('exceptions')
				.select('id', { count: 'exact', head: true })
				.is('revoked_at', null)
				.gt('expires_at', now)
				.lte('expires_at', soon),
		])

	if (hypothetical.error || actual.error) {
		logger.error('[compliance] Failed to compute metrics', {
			error: hypothetical.error?.message ?? actual.error?.message,
		})
	}

	return {
		hypotheticalRestrictedCount: hypothetical.count ?? 0,
		actualRestrictedCount: actual.count ?? 0,
		mismatchCount: mismatches.count ?? 0,
		manualReviewCount: manualReview.count ?? 0,
		activeExceptionCount: activeExceptions.count ?? 0,
		expiringExceptionCount: expiringExceptions.count ?? 0,
	}
}
