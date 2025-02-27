import * as z from 'zod'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif']
export const MAX_LENGTHS = {
	tagline: 120,
	description: 500,
}

export const projectFormSchema = z.object({
	// Step 1
	website: z
		.string()
		.url('Please enter a valid URL')
		.optional()
		.or(z.literal('')),
	location: z.string().min(1, 'Location is required'),
	category: z.string().min(1, 'Please select a category'),
	description: z.string().min(1, 'Description is required'),

	// Step 2
	previousFunding: z
		.string()
		.min(1, 'Previous funding amount is required')
		.refine((val) => !Number.isNaN(Number(val)), 'Must be a valid number'),
	fundingGoal: z
		.string()
		.min(1, 'Funding goal is required')
		.refine((val) => !Number.isNaN(Number(val)), 'Must be a valid number'),
	currency: z.string().min(1, 'Please select a currency'),
	image: z
		.any()
		.optional()
		.refine(
			(file) => !file || file?.size <= MAX_FILE_SIZE,
			'File size must be less than 5MB',
		)
		.refine(
			(file) => !file || ACCEPTED_IMAGE_TYPES.includes(file?.type),
			'Only .jpg, .jpeg, .png and .gif formats are supported',
		),

	// Step 3
	projectSupport: z
		.string()
		.min(20, 'Must be at least 20 characters')
		.max(1000, 'Must not exceed 1000 characters'),
	fundUsage: z
		.string()
		.min(20, 'Must be at least 20 characters')
		.max(1000, 'Must not exceed 1000 characters'),

	// Edit Project
	companyName: z.string().min(1, 'This field is required'),
	tagline: z.string().max(MAX_LENGTHS.tagline),
	editDescription: z
		.string()
		.min(1, 'This field is required')
		.max(MAX_LENGTHS.description),
})

export const editProjectFormSchema = z.object({
	companyName: z.string().min(1, 'This field is required'),
	tagline: z.string().max(MAX_LENGTHS.tagline),
	description: z
		.string()
		.min(1, 'This field is required')
		.max(MAX_LENGTHS.description),
	category: z.string().min(1, 'Please select a category'),
	tags: z
		.array(z.string().min(1, 'Tag is required'))
		.min(1, 'At least one tag is required'),
	image: z.string().url('Image URL is invalid'),
	video: z.string().url('Video URL is invalid').optional().or(z.literal('')),
	website: z
		.string()
		.url('Please enter a valid URL')
		.optional()
		.or(z.literal('')),
	twitter: z
		.string()
		.url('Please enter a valid URL')
		.optional()
		.or(z.literal('')),
	linkedin: z
		.string()
		.url('Please enter a valid URL')
		.optional()
		.or(z.literal('')),
	instagram: z
		.string()
		.url('Please enter a valid URL')
		.optional()
		.or(z.literal('')),
	tiktok: z
		.string()
		.url('Please enter a valid URL')
		.optional()
		.or(z.literal('')),
	youtube: z
		.string()
		.url('Please enter a valid URL')
		.optional()
		.or(z.literal('')),
	facebook: z
		.string()
		.url('Please enter a valid URL')
		.optional()
		.or(z.literal('')),
})

export type ProjectFormData = z.infer<typeof projectFormSchema>
export type EditProjectFormData = z.infer<typeof editProjectFormSchema>

// Validation schemas for each step
export const step1Fields: (keyof ProjectFormData)[] = [
	'website',
	'location',
	'category',
	'description',
]

export const step2Fields: (keyof ProjectFormData)[] = [
	'previousFunding',
	'fundingGoal',
	'currency',
	'image',
]

export const step3Fields: (keyof ProjectFormData)[] = [
	'projectSupport',
	'fundUsage',
]

export const editFormFields: (keyof EditProjectFormData)[] = [
	'companyName',
	'tagline',
	'description',
	'image',
	'website',
	'twitter',
	'linkedin',
	'instagram',
	'facebook',
	'youtube',
]

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

export type ProjectStory = z.infer<typeof projectStorySchema>
