import { z } from 'zod'

export const listDisputesQuerySchema = z.object({
	escrowId: z.string().uuid('Escrow ID is required'),
	status: z.string().optional(),
})
