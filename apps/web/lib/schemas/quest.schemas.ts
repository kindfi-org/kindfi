import { z } from 'zod'

export const createQuestSchema = z.object({
	quest_type: z.string().min(1, 'Quest type is required'),
	name: z.string().min(1, 'Name is required'),
	description: z.string().min(1, 'Description is required'),
	target_value: z.coerce
		.number()
		.int('Target value must be an integer')
		.positive('Target value must be positive'),
	reward_points: z.coerce.number().int().min(0).optional().default(0),
	expires_at: z.string().optional().nullable(),
	contract_address: z.string().optional().nullable(),
})

export const questProgressSchema = z.object({
	quest_id: z.coerce
		.number()
		.int('Quest ID must be an integer')
		.positive('Quest ID is required'),
	progress_value: z.coerce
		.number()
		.int('Progress value must be an integer')
		.min(0, 'Progress value must be non-negative'),
	user_address: z.string().optional(),
})
