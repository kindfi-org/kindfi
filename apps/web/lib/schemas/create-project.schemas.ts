import * as z from 'zod'

import { isAllowedSocialUrl, isFile } from '~/lib/utils/project-utils'

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
	image: z
		.union([
			z.string().url('Project Image must be a valid URL'),
			z.custom<File>(
				(v) => isFile(v),
				'Project Image must be a File upload or URL',
			),
		])
		.nullable(),
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
				name: z.string(),
				color: z.string(),
			}),
		)
		.optional(),
})

// YouTube URL regex pattern
const youtubeRegex =
	/^(https:\/\/)(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[a-zA-Z0-9_-]{11}(&.*)?$/

// Vimeo URL regex pattern
const vimeoRegex = /^(https:\/\/)(www\.)?(vimeo\.com\/)[0-9]+(\?.*)?$/

export const projectPitchSchema = z.object({
	title: z
		.string()
		.min(1, 'Title is required')
		.max(100, 'Title must be less than 100 characters'),
	story: z
		.string()
		.trim()
		.refine(
			(val) => {
				const plainText = val.replace(/<[^>]*>/g, '').trim() // remove HTML tags
				return plainText.length >= 50
			},
			{ message: 'Story must be at least 50 characters long' },
		),
	pitchDeck: z
		.union([
			z.string().url('Pitch deck must be a valid URL'),
			z.custom<File>(
				(v) => isFile(v),
				'Pitch deck must be a File upload or URL',
			),
		])
		.nullable(),
	videoUrl: z
		.string()
		.transform((v) => v.trim())
		.transform((v) => (v === '' ? null : v))
		.refine(
			(url) => {
				if (url === null) return true
				return youtubeRegex.test(url) || vimeoRegex.test(url)
			},
			{
				message: 'Please enter a valid HTTPS YouTube or Vimeo URL',
			},
		),
})
