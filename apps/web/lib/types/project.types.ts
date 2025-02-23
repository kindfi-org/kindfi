import type { ReactNode } from 'react'
import type { createImageUrl } from '~/lib/utils/types-helpers'

/** Custom type for percentage values between 0-100 */
export type TPercentage = number & { readonly __brand: 'percentage' }

/** Custom type for non-empty string values */
export type NonEmptyString = string & { readonly __brand: 'non-empty-string' }

// TODO: Add more Tailwind color combinations as needed. Better use a className instead of a TW string for better readability...
/** Allowed Tailwind color combinations for category styling */
export type TailwindColor =
	| 'bg-teal-50/80 text-teal-700 hover:bg-teal-100/80 border-teal-200/50' // project-category__teal
	| 'bg-green-50/80 text-green-700 hover:bg-green-100/80 border-green-200/50' // project-category__green
	| 'bg-rose-50/80 text-rose-700 hover:bg-rose-100/80 border-rose-200/50' // project-category__rose
	| 'bg-slate-50/80 text-slate-700 hover:bg-slate-100/80 border-slate-200/50' // project-category__slate
	| 'border-cyan-200/50 text-cyan-700 hover:bg-cyan-50/80' // project-category__cyan
	| 'border-orange-200/50 text-orange-700 hover:bg-orange-50/80' // project-category__orange
	| 'border-purple-200/50 text-purple-700 hover:bg-purple-50/80' // project-category__purple
	| 'border-emerald-200/50 text-emerald-700 hover:bg-emerald-50/80' // project-category__emerald
	| 'bg-sky-50/80 text-sky-700 hover:bg-sky-100/80 border-sky-200/50' // project-category__sky
	| 'bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100/80 border-indigo-200/50' // project-category__indigo
	| 'bg-red-50/80 text-red-700 hover:bg-red-100/80 border-red-200/50' // category-red
/**add more if needed */

/** Represents a monetary value with precision handling */
export type TMoney = number & { readonly __brand: 'money' }

/** Interface representing a project tag */
export interface ProjectTag {
	/** Unique identifier for the tag */
	id: string
	/** Display text for the tag */
	text: string
	color: {
		backgroundColor: string
		textColor: string
	}
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
	currentAmount: TMoney
	/** Target funding amount */
	targetAmount: TMoney
	/** Number of investors */
	investors: number
	/** Minimum investment amount allowed */
	minInvestment: TMoney
	/** Funding progress percentage (0-100) */
	percentageComplete: TPercentage
	/** Project tags */
	tags: ProjectTag[]
}
