import type {
	Category,
	Contribution,
	EscrowContract,
	Milestone,
	Profile,
	Project,
	ProjectMember,
	ProjectUpdate,
} from './tables'

// Extended types with relationships
export interface ProjectWithDetails extends Project {
	milestones: Milestone[]
	creator: Pick<Profile, 'id' | 'display_name' | 'image_url'>
	category: Category | null
	project_members: ProjectMember[]
	contributions: Contribution[]
	stats: ProjectStats
}

export interface ProjectWithMilestones extends Project {
	milestones: Milestone[]
	creator: Pick<Profile, 'id' | 'display_name' | 'image_url'>
}

export interface MilestoneWithProject extends Milestone {
	project: Pick<Project, 'id' | 'title' | 'owner_id'>
}

export interface EscrowContractWithDetails extends EscrowContract {
	project: Pick<Project, 'id' | 'title'>
	milestone?: Pick<Milestone, 'id' | 'title'>
}

export interface ProfileWithProjects extends Profile {
	owned_projects: Project[]
	project_memberships: ProjectMember[]
}

export interface ProjectMemberWithDetails extends ProjectMember {
	user: Pick<Profile, 'id' | 'display_name' | 'image_url'>
	project: Pick<Project, 'id' | 'title'>
}

// Stats types
export interface ProjectStats {
	total_contributions: number
	total_contributors: number
	funding_percentage: number
	days_remaining?: number
	milestone_completion_rate: number
}

// Form types for UI components
export interface CreateProjectForm {
	title: string
	description: string
	target_amount: number
	min_investment: number
	category_id?: string
	image_url?: string
	milestones: Array<{
		title: string
		description: string
		amount: number
		deadline: string
		order_index: number
	}>
}

export interface UpdateProjectForm
	extends Partial<Omit<CreateProjectForm, 'milestones'>> {
	id: string
}

export interface CreateMilestoneForm {
	project_id: string
	title: string
	description: string
	amount: number
	deadline: string
	order_index: number
}

export interface UpdateMilestoneForm
	extends Partial<Omit<CreateMilestoneForm, 'project_id'>> {
	id: string
}

export interface CreateProjectPitchForm {
	project_id: string
	title: string
	story: string
	video_url?: string
	pitch_deck?: string
}

export interface UpdateProjectPitchForm
	extends Partial<Omit<CreateProjectPitchForm, 'project_id'>> {
	id: string
}

export interface CreateContributionForm {
	project_id: string
	amount: number
	contributor_id: string
}

export interface CreateProjectMemberForm {
	project_id: string
	user_id: string
	role: 'admin' | 'editor'
	title: string
}

// Search and filter types
export interface ProjectFilters {
	category_id?: string
	owner_id?: string
	min_amount?: number
	max_amount?: number
	min_investment?: number
	max_investment?: number
	search?: string
	tags?: string[]
}

export interface MilestoneFilters {
	project_id?: string
	status?: Milestone['status']
	deadline_before?: string
	deadline_after?: string
	min_amount?: number
	max_amount?: number
}

export interface ContributionFilters {
	project_id?: string
	contributor_id?: string
	min_amount?: number
	max_amount?: number
	date_from?: string
	date_to?: string
}

export interface ProfileFilters {
	role?: Profile['role']
	search?: string
	has_projects?: boolean
}

// Pagination types
export interface PaginationParams {
	page: number
	limit: number
	order_by?: string
	order_direction?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
	data: T[]
	pagination: {
		page: number
		limit: number
		total: number
		total_pages: number
		has_next: boolean
		has_prev: boolean
	}
}

// API Response types
export interface ApiResponse<T> {
	data: T
	success: boolean
	message?: string
	errors?: Record<string, string[]>
}

export interface ApiError {
	message: string
	code?: string
	details?: Record<string,  unknown>
}

// Dashboard types
export interface ProjectDashboard {
	project: ProjectWithDetails
	recent_updates: ProjectUpdate[]
	recent_contributions: Contribution[]
	active_milestones: Milestone[]
	completion_rate: number
}

export interface UserDashboard {
	profile: Profile
	owned_projects: Project[]
	contributed_projects: Project[]
	total_contributions: number
	total_projects: number
}

// Compatibility aliases for backward compatibility
export type Campaign = Project
export type CampaignWithMilestones = ProjectWithMilestones
export type CampaignWithDetails = ProjectWithDetails
export type CampaignStats = ProjectStats
export type CreateCampaignForm = CreateProjectForm
export type UpdateCampaignForm = UpdateProjectForm
export type CampaignFilters = ProjectFilters
export type User = Profile
export type Escrow = EscrowContract
export type EscrowWithDetails = EscrowContractWithDetails
