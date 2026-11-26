import { z } from 'zod'
import { PROTECTED_ACTIONS, RISK_LEVELS } from '~/lib/compliance/types'

const isoAlpha2 = z
	.string()
	.length(2, 'Country code must be an ISO 3166-1 alpha-2 code')
	.regex(/^[A-Za-z]{2}$/, 'Country code must be an ISO 3166-1 alpha-2 code')
	.transform((v) => v.toUpperCase())

export const countryRiskLevelSchema = z.enum(RISK_LEVELS)
export const protectedActionSchema = z.enum(PROTECTED_ACTIONS)

export const createDraftPolicyInputSchema = z.object({
	name: z.string().min(1, 'Name is required').max(200),
	reason: z.string().min(10, 'Reason must explain the policy change (min 10 characters)').max(2000),
	policyReference: z.string().min(1, 'Policy reference is required').max(200),
	effectiveStart: z.string().datetime({ offset: true }).or(z.string().min(1)),
	effectiveEnd: z.string().datetime({ offset: true }).or(z.string()).optional().nullable(),
	countryRules: z
		.array(z.object({ countryCode: isoAlpha2, riskLevel: countryRiskLevelSchema }))
		.default([]),
	actions: z.array(protectedActionSchema).default([]),
})

export const policyActionInputSchema = z.object({
	policyId: z.string().uuid(),
	reason: z.string().min(10, 'A reason is required for every policy change').max(2000),
})

export const createExceptionInputSchema = z.object({
	userId: z.string().uuid(),
	action: protectedActionSchema,
	policyId: z.string().uuid().optional().nullable(),
	reason: z.string().min(10, 'A justification is required').max(2000),
	approverUserId: z.string().uuid().optional().nullable(),
	expiresAt: z.string().min(1, 'Expiration date is required'),
})

export const revokeExceptionInputSchema = z.object({
	exceptionId: z.string().uuid(),
	reason: z.string().min(10, 'A reason is required to revoke an exception').max(2000),
})
