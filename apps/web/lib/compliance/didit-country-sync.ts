import { logger } from '@/lib/logger'
import { recordComplianceAuditEvent } from './audit-log'
import { getCountryProfile } from './country-declaration-service'
import { getComplianceSchemaClient } from './supabase-compliance-client'
import type { CountryVerificationStatus } from './types'

/**
 * KNOWN GAP — stubbed integration, not wired to a live Didit payload.
 *
 * Didit is KindFi's sole KYC provider (see apps/web/lib/services/didit.ts
 * and apps/web/app/api/kyc/didit/webhook/route.ts). As of this change, the
 * existing Didit webhook handler processes verification *status* only — it
 * does not extract or persist a verified country of residence, because the
 * `decision` payload shape for country/document data was not being parsed
 * anywhere in this codebase (checked before writing this stub).
 *
 * This function is the interface the real Didit webhook/sync flow should
 * call once that payload is parsed: pass the Didit-verified ISO 3166-1
 * alpha-2 country code extracted from `decision.id_verification` (or the
 * equivalent field Didit returns for the enabled workflow) for the given
 * user. It is intentionally NOT called from
 * apps/web/app/api/kyc/didit/webhook/route.ts yet — wiring it in requires:
 *   1. Confirming which Didit workflow features are enabled and what field
 *      carries the verified country in the `decision` object.
 *   2. Deciding whether a country the workflow doesn't verify should mark
 *      status `unavailable` rather than silently skipping the update.
 * Until that's done, `verification_status` for all users stays at
 * `declared` or `unavailable` — never `verified` — so enforcement (if ever
 * turned on) cannot rely on a fabricated verified country.
 */
export async function syncVerifiedCountryFromDidit(
	userId: string,
	verifiedCountryCode: string,
): Promise<
	{ success: true; status: CountryVerificationStatus } | { success: false; error: string }
> {
	const normalized = verifiedCountryCode.toUpperCase()
	const now = new Date().toISOString()

	const existing = await getCountryProfile(userId)
	const status: CountryVerificationStatus =
		existing?.declaredCountry && existing.declaredCountry !== normalized ? 'mismatched' : 'verified'

	const { error } = await getComplianceSchemaClient().from('country_declarations').upsert(
		{
			user_id: userId,
			verified_country: normalized,
			verified_country_updated_at: now,
			verification_status: status,
			updated_at: now,
		},
		{ onConflict: 'user_id' },
	)

	if (error) {
		logger.error('[compliance] Failed to sync verified country from Didit', {
			userId,
			error: error.message,
		})
		return { success: false, error: 'Failed to record verified country.' }
	}

	await recordComplianceAuditEvent({
		eventType: 'declared_country_set',
		targetUserId: userId,
		declaredCountry: existing?.declaredCountry ?? null,
		verifiedCountry: normalized,
		verificationStatus: status,
		reason: 'Verified country synced from Didit (stubbed sync path).',
	})

	if (status === 'mismatched') {
		await recordComplianceAuditEvent({
			eventType: 'mismatch_detected',
			targetUserId: userId,
			declaredCountry: existing?.declaredCountry ?? null,
			verifiedCountry: normalized,
			verificationStatus: status,
			reason: 'Didit-verified country does not match self-declared country.',
		})
	}

	return { success: true, status }
}
