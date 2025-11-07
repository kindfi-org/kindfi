/**
 * KYC Status and Verification Level Enums
 *
 * These are extracted from the database schema to avoid importing
 * server-side database dependencies (drizzle-orm/pg-core) in client bundles.
 */

export const KYC_STATUS_VALUES = [
	'pending',
	'approved',
	'rejected',
	'verified',
] as const
export type KycStatusType = (typeof KYC_STATUS_VALUES)[number]

export const KYC_VERIFICATION_VALUES = ['basic', 'enhanced'] as const
export type KycVerificationType = (typeof KYC_VERIFICATION_VALUES)[number]
