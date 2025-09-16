import { z } from 'zod'

export const kycStatusSchema = z.enum(['pending', 'approved', 'rejected', 'verified'])

export const kycVerificationLevelSchema = z.enum(['basic', 'enhanced'])

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