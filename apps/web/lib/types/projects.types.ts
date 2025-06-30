import type { LucideIcon } from 'lucide-react'

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

export interface Creator {
	id: number | string
	name: string
	image: string
	verified: boolean
	completed_projects: number
	role?: string
	total_raised?: number
	followers?: number
	recent_project?: string
	total_current_amount?: number
}
export interface Tag {
	id: string | number
	text: string
	color?: { backgroundColor: string; textColor: string } | string
}
export interface ProjectCategory {
	id: string
	label: string
	value: string
	icon: LucideIcon
	description?: string
}

export interface Project {
	id: number | string
	title: string
	description: string
	image_url?: string
	video_url?: string
	rating?: string
	relatedProjects?: []
	//for project that has the category field as an array of strings
	categories: string[]
	location?: string

	// Financial metrics
	current_amount: number
	target_amount: number
	raised?: number
	goal?: number
	min_investment: number

	// Participation metrics
	kinder_count: number
	donors?: number

	// Progress tracking
	milestones?: number
	completed_milestones?: number
	percentage_complete?: number

	// Tags and categorization
	tags: Tag[] | string[]
	trending?: boolean
	featured?: boolean

	// Metadata
	created_at: string

	// Creator information
	creator?: Creator
}
