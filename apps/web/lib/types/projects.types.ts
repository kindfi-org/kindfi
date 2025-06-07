import type { LucideIcon } from 'lucide-react'
import type { Tables, Enums } from './database.types'


/** Custom type for percentage values between 0-100 */
export type TPercentage = number & { readonly __brand: 'percentage' }

/** Custom type for non-empty string values */
export type NonEmptyString = string & { readonly __brand: 'non-empty-string' }

/** Represents a monetary value with precision handling */
export type TMoney = number & { readonly __brand: 'money' }

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

// Supabase table type shortcuts
type ProjectRow = Tables<'projects'>
type CategoryRow = Tables<'categories'>
type ProfileRow = Tables<'profiles'>
type ProjectTagRow = Tables<'project_tags'>
type ProjectMemberRow = Tables<'project_members'>
type MilestoneRow = Tables<'milestones'>

// Supabase enum shortcuts
type UserRole = Enums<'user_role'>
type ProjectMemberRole = Enums<'project_member_role'>
type MilestoneStatus = Enums<'milestone_status'>

/** Creator/Profile interface using Supabase types */
export interface Creator {
	id: string | number
	name: string
	image: string
	role?: string | UserRole
	verified?: boolean
	completed_projects?: number
	total_raised?: number
	followers?: number
	recent_project?: string
	total_current_amount?: number
	// Optional Supabase profile fields
	display_name?: string
	bio?: string
	image_url?: string
	created_at?: string
	updated_at?: string
}

/** Tag interface using Supabase project_tags table */
export interface Tag extends Pick<ProjectTagRow, 'id' | 'name'> {
	text?: string // Keep for backward compatibility
	color?: { backgroundColor: string; textColor: string } | string
}

/** Project Category interface using Supabase categories table */
export interface ProjectCategory extends Pick<CategoryRow, 'id' | 'name' | 'slug'> {
	label: string
	value: string
	icon: LucideIcon
	description?: string
	color: string
}

/** Enhanced Project interface using Supabase types */
export interface Project {
	// Core required fields
	id: string | number
	title: string
	description: string | null
	current_amount: number
	target_amount: number
	min_investment: number
	investors_count: number
	created_at: string
	
	// Optional Supabase fields
	owner_id?: string
	category_id?: string | null
	image_url?: string | null
	updated_at?: string | null
	percentage_complete?: number
	
	// Additional computed/derived fields
	raised?: number
	goal?: number
	donors?: number
	rating?: string
	video_url?: string
	location?: string
	
	// Related data
	categories: string[]
	tags: Tag[] | string[]
	creator?: Creator
	milestones?: number
	members?: ProjectMemberRow[]
	relatedProjects?: Project[]
	
	// Progress tracking
	completed_milestones?: number
	
	// Feature flags
	trending?: boolean
	featured?: boolean
}

/** Milestone interface with enhanced typing */
export interface Milestone extends Omit<MilestoneRow, 'amount'> {
	amount: TMoney
	status: MilestoneStatus
}

/** Project member interface with enhanced profile data */
export interface ProjectMember extends ProjectMemberRow {
	profile?: ProfileRow
	role: ProjectMemberRole
}

/** Type for project creation/insertion */
export type ProjectInsert = Tables<'projects'> & {
	categories?: string[]
	tags?: string[]
}

/** Type for project updates */
export type ProjectUpdate = Tables<'projects'> & {
	categories?: string[]
	tags?: string[]
}