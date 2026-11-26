import { logger } from '@/lib/logger'
import { recordComplianceAuditEvent } from './audit-log'
import { getComplianceSchemaClient } from './supabase-compliance-client'
import type { CountryProfile, CountryVerificationStatus } from './types'

interface CountryDeclarationRow {
	user_id: string
	declared_country: string | null
	declared_country_updated_at: string | null
	verified_country: string | null
	verified_country_updated_at: string | null
	verification_status: CountryVerificationStatus
	ip_country_signal: string | null
}

function rowToProfile(row: CountryDeclarationRow): CountryProfile {
	return {
		userId: row.user_id,
		declaredCountry: row.declared_country,
		declaredCountryUpdatedAt: row.declared_country_updated_at,
		verifiedCountry: row.verified_country,
		verifiedCountryUpdatedAt: row.verified_country_updated_at,
		verificationStatus: row.verification_status,
		ipCountrySignal: row.ip_country_signal,
	}
}

function resolveVerificationStatus(
	declared: string | null,
	verified: string | null,
): CountryVerificationStatus {
	if (verified && declared) {
		return verified === declared ? 'verified' : 'mismatched'
	}
	if (verified) return 'verified'
	if (declared) return 'declared'
	return 'unavailable'
}

export async function getCountryProfile(userId: string): Promise<CountryProfile | null> {
	const { data, error } = await getComplianceSchemaClient()
		.from('country_declarations')
		.select('*')
		.eq('user_id', userId)
		.maybeSingle()

	if (error) {
		logger.error('[compliance] Failed to load country profile', {
			userId,
			error: error.message,
		})
		return null
	}

	if (!data) return null
	return rowToProfile(data as CountryDeclarationRow)
}

/**
 * Sets or updates the user's self-declared country of residence.
 *
 * This is the mandatory onboarding/profile touchpoint required by issue
 * #1009. It NEVER writes to the verified_country columns — those are only
 * ever written by `syncVerifiedCountryFromDidit` — so a declared-country
 * update can never silently overwrite a Didit-verified value.
 */
export async function setDeclaredCountry(
	userId: string,
	countryCode: string,
): Promise<{ success: true; profile: CountryProfile } | { success: false; error: string }> {
	const normalized = countryCode.toUpperCase()
	const now = new Date().toISOString()

	const existing = await getCountryProfile(userId)
	const verificationStatus = resolveVerificationStatus(
		normalized,
		existing?.verifiedCountry ?? null,
	)

	const { data, error } = await getComplianceSchemaClient()
		.from('country_declarations')
		.upsert(
			{
				user_id: userId,
				declared_country: normalized,
				declared_country_updated_at: now,
				verification_status: verificationStatus,
				updated_at: now,
			},
			{ onConflict: 'user_id' },
		)
		.select('*')
		.single()

	if (error || !data) {
		logger.error('[compliance] Failed to set declared country', {
			userId,
			error: error?.message,
		})
		return { success: false, error: 'Failed to save country of residence.' }
	}

	const profile = rowToProfile(data as CountryDeclarationRow)

	await recordComplianceAuditEvent({
		eventType: 'declared_country_set',
		targetUserId: userId,
		declaredCountry: normalized,
		verifiedCountry: profile.verifiedCountry,
		verificationStatus,
	})

	if (verificationStatus === 'mismatched') {
		await recordComplianceAuditEvent({
			eventType: 'mismatch_detected',
			targetUserId: userId,
			declaredCountry: normalized,
			verifiedCountry: profile.verifiedCountry,
			verificationStatus,
			reason: 'Declared country changed and no longer matches Didit-verified country.',
		})
	}

	return { success: true, profile }
}

export function hasDeclaredCountry(profile: CountryProfile | null): boolean {
	return Boolean(profile?.declaredCountry)
}
