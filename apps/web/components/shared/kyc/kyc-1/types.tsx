import type { Control } from 'react-hook-form'
import * as z from 'zod'

// Define validation schema
export const identitySchema = z.object({
	fullName: z.string().min(3, 'Full name must be at least 3 characters'),
	dateOfBirth: z
		.date({
			required_error: 'Date of birth is required',
		})
		.refine((date) => {
			const today = new Date()
			today.setHours(0, 0, 0, 0)
			const eighteenYearsAgo = new Date()
			eighteenYearsAgo.setFullYear(today.getFullYear() - 18)
			eighteenYearsAgo.setHours(0, 0, 0, 0)
			return date <= eighteenYearsAgo
		}, 'You must be at least 18 years old'),
	nationality: z.string().min(1, 'Nationality is required'),
})

export type IdentityFormValues = z.infer<typeof identitySchema>

export interface IdentityVerificationProps {
	onCancel: () => void
	onNext: (data: IdentityFormValues) => void
	defaultValues?: Partial<IdentityFormValues>
}

export interface FormFieldProps {
	control: Control<IdentityFormValues>
}

// List of countries for the nationality dropdown
export const countries = [
	'United States',
	'United Kingdom',
	'Canada',
	'Australia',
	'Germany',
	'France',
	'Japan',
	'China',
	'India',
	'Brazil',
	'Mexico',
	'Spain',
	'Italy',
	'Russia',
	'South Africa',
	'Nigeria',
	'Egypt',
	'Saudi Arabia',
	'Singapore',
	'Malaysia',
	'Indonesia',
	'Thailand',
	'New Zealand',
	'South Korea',
	'Argentina',
	'Colombia',
	'Chile',
	'Peru',
	'Sweden',
	'Norway',
	'Finland',
	'Denmark',
	'Netherlands',
	'Belgium',
	'Switzerland',
	'Austria',
]
