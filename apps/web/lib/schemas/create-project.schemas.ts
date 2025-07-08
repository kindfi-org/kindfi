import * as z from 'zod'

import { isAllowedSocialUrl } from '../utils/create-project-helpers'

export const stepOneSchema = z
	.object({
		title: z.string().min(3, 'Title must be at least 3 characters'),
		description: z
			.string()
			.min(10, 'Description must be at least 10 characters'),
		targetAmount: z.number().min(1, 'Target amount must be at least $1'),
		minimumInvestment: z
			.number()
			.min(1, 'Minimum investment must be at least $1'),
	})
	.refine((data) => data.minimumInvestment <= data.targetAmount, {
		message: 'Minimum investment cannot exceed target amount',
		path: ['minimumInvestment'],
	})

export const stepTwoSchema = z.object({
	image: z.any().nullable(),
	website: z
		.string()
		.url('Please enter a valid URL (e.g., https://example.com)')
		.refine((url) => url.startsWith('https://'), {
			message: 'Website URL must use HTTPS for security',
		})
		.optional()
		.or(z.literal('')),
	socialLinks: z
		.array(
			z
				.string()
				.url('Please enter a valid social media URL')
				.refine(isAllowedSocialUrl, {
					message: 'Please enter a valid social media URL',
				}),
		)
		.optional(),
})

export const stepThreeSchema = z.object({
	location: z.string().length(3, 'Select a valid country'), // e.g. "CRI"
	category: z.string().min(1, 'Please select a category'),
	tags: z
		.array(
			z.object({
				label: z.string(),
				color: z.string(),
			}),
		)
		.optional(),
})

export const projectStorySchema = z.object({
	title: z
		.string()
		.min(1, 'Title is required')
		.max(100, 'Title must be less than 100 characters'),
	story: z.string().min(1, 'Story is required'),
	pitchDeck: z
		.object({
			url: z.string().optional(),
			size: z.number().max(10 * 1024 * 1024, 'File must be less than 10MB'),
		})
		.optional(),
	videoUrl: z
		.string()
		.url('Must be a valid URL')
		.refine(
			(url) =>
				url.includes('youtube.com') ||
				url.includes('youtu.be') ||
				url.includes('vimeo.com'),
			'Must be a YouTube or Vimeo URL',
		)
		.optional(),
})
