import { logger } from '@/lib/logger'
import { getKycSchemaClient } from './supabase-kyc-client'
import type { CanonicalKycStatus, KycFinancialAction } from './types'
import { KYC_FINANCIAL_ACTIONS } from './types'

export interface KycActionMetric {
	action: KycFinancialAction
	total: number
	withoutApprovedKyc: number
	wouldHaveBlocked: number
}

export interface KycStatusDistribution {
	status: CanonicalKycStatus | string
	count: number
}

export interface KycDailyTrend {
	date: string
	withoutApprovedKyc: number
	wouldHaveBlocked: number
}

export interface KycEnforcementMetrics {
	periodDays: number
	actionsWithoutApprovedKyc: number
	wouldHaveBlocked: number
	statusResolutionFailures: number
	byAction: KycActionMetric[]
	statusDistribution: KycStatusDistribution[]
	trends: KycDailyTrend[]
}

const emptyActionMetrics = (): KycActionMetric[] =>
	KYC_FINANCIAL_ACTIONS.map((action) => ({
		action,
		total: 0,
		withoutApprovedKyc: 0,
		wouldHaveBlocked: 0,
	}))

interface AuthorizationEventRow {
	action: string
	current_kyc_status: string
	hypothetical_allowed: boolean
	decision_allowed: boolean
	created_at: string
}

interface WebhookFailureRow {
	id: string
}

interface SessionStatusRow {
	canonical_status: string
}

/**
 * Aggregate monitor-mode metrics. Counts only authorization and webhook
 * metadata — never identity documents or Didit decision payloads.
 */
export const getKycEnforcementMetrics = async (sinceDays = 30): Promise<KycEnforcementMetrics> => {
	const client = getKycSchemaClient()
	const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000).toISOString()

	const [eventsResult, failuresResult, sessionsResult] = await Promise.all([
		client
			.from('authorization_events')
			.select('action, current_kyc_status, hypothetical_allowed, decision_allowed, created_at')
			.gte('created_at', since),
		client
			.from('webhook_events')
			.select('id')
			.in('processing_result', ['unmapped', 'error'])
			.gte('processed_at', since),
		client.from('didit_sessions').select('canonical_status'),
	])

	if (eventsResult.error) {
		logger.error('[kyc] Failed to load authorization metrics', {
			error: eventsResult.error.message,
		})
	}

	const events = (eventsResult.data ?? []) as AuthorizationEventRow[]
	const failures = (failuresResult.data ?? []) as WebhookFailureRow[]
	const sessions = (sessionsResult.data ?? []) as SessionStatusRow[]

	const byActionMap = new Map(emptyActionMetrics().map((row) => [row.action, row]))
	const trendsMap = new Map<string, KycDailyTrend>()

	for (const event of events) {
		const action = event.action as KycFinancialAction
		const bucket = byActionMap.get(action)
		if (bucket) {
			bucket.total += 1
			if (event.current_kyc_status !== 'approved') {
				bucket.withoutApprovedKyc += 1
			}
			if (!event.hypothetical_allowed) {
				bucket.wouldHaveBlocked += 1
			}
		}

		const date = event.created_at.slice(0, 10)
		const trend = trendsMap.get(date) ?? {
			date,
			withoutApprovedKyc: 0,
			wouldHaveBlocked: 0,
		}
		if (event.current_kyc_status !== 'approved') {
			trend.withoutApprovedKyc += 1
		}
		if (!event.hypothetical_allowed) {
			trend.wouldHaveBlocked += 1
		}
		trendsMap.set(date, trend)
	}

	const statusCounts = new Map<string, number>()
	for (const session of sessions) {
		const status = session.canonical_status || 'not_started'
		statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1)
	}

	const byAction = KYC_FINANCIAL_ACTIONS.map(
		(action) =>
			byActionMap.get(action) ?? { action, total: 0, withoutApprovedKyc: 0, wouldHaveBlocked: 0 },
	)

	return {
		periodDays: sinceDays,
		actionsWithoutApprovedKyc: events.filter((event) => event.current_kyc_status !== 'approved')
			.length,
		wouldHaveBlocked: events.filter((event) => !event.hypothetical_allowed).length,
		statusResolutionFailures: failures.length,
		byAction,
		statusDistribution: [...statusCounts.entries()].map(([status, count]) => ({ status, count })),
		trends: [...trendsMap.values()].sort((a, b) => a.date.localeCompare(b.date)),
	}
}
