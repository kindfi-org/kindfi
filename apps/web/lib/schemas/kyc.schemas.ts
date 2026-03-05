import { z } from 'zod'

export const createDiditSessionSchema = z.object({
	redirectUrl: z.string().url('Invalid redirect URL'),
	metadata: z.record(z.unknown()).optional(),
})
