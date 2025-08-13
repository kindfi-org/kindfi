import type { Tables } from '@services/supabase'
import type { z } from 'zod'
import type {
	projectPitchSchema,
	stepOneSchema,
	stepThreeSchema,
	stepTwoSchema,
} from '~/lib/schemas/create-project.schemas'
import type { SocialLinks } from './project-detail.types'

export interface Tag {
	name: string
	color: string
}

export interface CreateProjectFormData {
	slug?: string
	// Step 1: Basic Information
	title: string
	description: string
	targetAmount: number
	minimumInvestment: number

	// Step 2: Media and Links
	image: string | File | null
	website?: string
	socialLinks: string[]

	// Step 3: Location and Classification
	location: string
	category: string
	tags: Tag[]
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
export type ProjectPitchData = z.infer<typeof projectPitchSchema>

export interface BasicProjectInfo {
	id: string
	slug: string | null
	title: string
	description: string | null
	goal: number
	minInvestment: number
	image: string | null
	socialLinks: SocialLinks
	location: string | null
	category: Tables<'categories'> | null
	tags: Tag[]
}
