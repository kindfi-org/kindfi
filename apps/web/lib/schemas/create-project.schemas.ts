import * as z from 'zod'

export const stepOneSchema = z
	.object({
		title: z.string().min(3, 'Title must be at least 3 characters'),
		description: z
			.string()
			.min(10, 'Description must be at least 10 characters'),
		targetAmount: z.number().positive('Target amount must be positive'),
		minimumInvestment: z
			.number()
			.positive('Minimum investment must be positive'),
	})
	.refine((data) => data.minimumInvestment <= data.targetAmount, {
		message: 'Minimum investment cannot exceed target amount',
		path: ['minimumInvestment'],
	})

export const stepTwoSchema = z.object({
	image: z.any().nullable(),
	website: z
		.string()
		.url('Please enter a valid URL')
		.optional()
		.or(z.literal('')),
	socialLinks: z.array(z.string().url('Please enter a valid URL')),
})

export const stepThreeSchema = z.object({
	location: z.string().length(3, 'Select a valid country'), // e.g. "CRI"
	category: z.string().min(1, 'Please select a category'),
	tags: z.array(z.string()).optional(),
})
