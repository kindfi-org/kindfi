import type { Database } from '@services/supabase'
import { z } from 'zod'

// Extract enum values from the database type to ensure consistency
export const kycStatusValues = ['pending', 'approved', 'rejected', 'verified'] as const satisfies readonly Database['public']['Enums']['kyc_status_enum'][]

export const kycVerificationLevelValues = ['basic', 'enhanced'] as const satisfies readonly Database['public']['Enums']['kyc_verification_enum'][]

// Create Zod schemas from database-derived values
export const kycStatusSchema = z.enum(kycStatusValues)

export const kycVerificationLevelSchema = z.enum(kycVerificationLevelValues)

export const kycUpdateDataSchema = z.object({
	user_id: z.string().uuid(),
	status: kycStatusSchema,
	verification_level: kycVerificationLevelSchema,
	timestamp: z.string().datetime()
})

export const kycUpdateSchema = z.object({
	type: z.literal('kyc_status'),
	data: kycUpdateDataSchema
})

export const kycStatusRecordSchema = z.object({
	user_id: z.string().uuid(),
	status: kycStatusSchema,
	verification_level: kycVerificationLevelSchema
}).passthrough()

export type KYCStatus = z.infer<typeof kycStatusSchema>
export type KYCVerificationLevel = z.infer<typeof kycVerificationLevelSchema>
export type KYCUpdateData = z.infer<typeof kycUpdateDataSchema>
export type KYCUpdate = z.infer<typeof kycUpdateSchema>
export type KYCStatusRecord = z.infer<typeof kycStatusRecordSchema>