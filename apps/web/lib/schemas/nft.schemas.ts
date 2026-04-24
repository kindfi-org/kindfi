import { z } from 'zod'

export const mintNftSchema = z.object({
	user_id: z.string().uuid().optional(),
	stellar_address: z.string().optional(),
})

export const evolveNftSchema = z.object({
	user_id: z.string().uuid().optional(),
})
