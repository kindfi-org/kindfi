import type { ReactNode } from 'react'

/** Custom type for percentage values between 0-100 */
type Percentage = number & { readonly __brand: 'percentage' }

/** Helper function to validate and create percentage values */
function createPercentage(value: number): Percentage {
	if (value < 0 || value > 100) {
		throw new Error('Percentage must be between 0 and 100')
	}
	return value as Percentage
}

/** Custom type for non-empty string values */
type NonEmptyString = string & { readonly __brand: 'non-empty-string' }

/** Helper function to validate and create project tag */
export function createProjectTag(id: string, text: string): ProjectTag {
	if (!id.trim()) throw new Error('Tag ID cannot be empty')
	if (!text.trim()) throw new Error('Tag text cannot be empty')
	return { id, text }
}

/** Allowed Tailwind color combinations for category styling */
type TailwindColor =
	| 'bg-teal-50/80 text-teal-700 hover:bg-teal-100/80 border-teal-200/50'
	| 'bg-green-50/80 text-green-700 hover:bg-green-100/80 border-green-200/50'
	| 'bg-rose-50/80 text-rose-700 hover:bg-rose-100/80 border-rose-200/50'
	| 'bg-slate-50/80 text-slate-700 hover:bg-slate-100/80 border-slate-200/50'
	| 'border-cyan-200/50 text-cyan-700 hover:bg-cyan-50/80'
	| 'border-orange-200/50 text-orange-700 hover:bg-orange-50/80'
	| 'border-purple-200/50 text-purple-700 hover:bg-purple-50/80'
	| 'border-emerald-200/50 text-emerald-700 hover:bg-emerald-50/80'
	| 'bg-sky-50/80 text-sky-700 hover:bg-sky-100/80 border-sky-200/50'
	| 'bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100/80 border-indigo-200/50'
	| 'bg-red-50/80 text-red-700 hover:bg-red-100/80 border-red-200/50'
/**add more if needed */

/** Represents a monetary value with precision handling */
type Money = number & { readonly __brand: 'money' }

/** Helper function to create monetary values */
function createMoney(value: number): Money {
	if (value < 0) throw new Error('Money cannot be negative')
	return Number(value.toFixed(2)) as Money
}

/** Helper function to validate image URLs */
function createImageUrl(url: string): string {
	try {
		new URL(url)
		return url
	} catch {
		throw new Error('Invalid image URL')
	}
}

/** Interface representing a project tag */
export interface ProjectTag {
	/** Unique identifier for the tag */
	id: string
	/** Display text for the tag */
	text: string
}

/** Interface representing a project category */
export interface ProjectCategory {
	/** Unique identifier for the category */
	id: string
	/** Icon component for the category */
	icon: ReactNode
	/** Display label for the category */
	label: string
	/** Tailwind CSS color classes for styling */
	color: TailwindColor
}

/** Interface representing a project */
export interface Project {
	/** Unique identifier for the project */
	id: string
	/** Path to project image */
	image: ReturnType<typeof createImageUrl>
	/** Reference to project category by ID */
	category: ProjectCategory['id']
	/** Project title */
	title: string
	/** Project description */
	description: string
	/** Current funding amount */
	currentAmount: Money
	/** Target funding amount */
	targetAmount: Money
	/** Number of investors */
	investors: number
	/** Minimum investment amount allowed */
	minInvestment: Money
	/** Funding progress percentage (0-100) */
	percentageComplete: Percentage
	/** Project tags */
	tags: ProjectTag[]
}

export {
	createPercentage,
	createMoney,
	createImageUrl,
	type Percentage,
	type NonEmptyString,
	type TailwindColor,
	type Money,
}
