import type { z } from 'zod'

import type {
	stepOneSchema,
	stepThreeSchema,
	stepTwoSchema,
} from '~/lib/schemas/create-project.schemas'

export interface CreateProjectFormData {
	// Step 1: Basic Information
	title: string
	description: string
	targetAmount: number
	minimumInvestment: number

	// Step 2: Media and Links
	image: File | null
	website?: string
	socialLinks: string[]

	// Step 3: Location and Classification
	location: string
	category: string
	tags: string[]
}

export interface CountryOption {
	alpha3: string
	alpha2: string
	name: string
}

// Inferred types from schemas
export type StepOneData = z.infer<typeof stepOneSchema>
export type StepTwoData = z.infer<typeof stepTwoSchema>
export type StepThreeData = z.infer<typeof stepThreeSchema>
