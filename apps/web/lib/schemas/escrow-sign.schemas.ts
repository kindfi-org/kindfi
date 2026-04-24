import { z } from 'zod'

export const signAndSubmitSchema = z.object({
	unsignedTransactionXDR: z.string().min(1, 'Unsigned transaction XDR is required'),
	userDevice: z.object({
		address: z.string().min(1, 'User device address is required'),
		credential_id: z.string().optional(),
	}).passthrough(),
})
