import type { Project } from './'

export interface ProjectDetail extends Project {
	// owner: ProjectOwner
	pitch: ProjectPitch
	// team: TeamMember[]
	// milestones: Milestone[]
	// updates: Update[]
	// comments: Comment[]
}

export interface ProjectOwner {
	id: string
	name: string
	avatar: string
	bio: string
}

export interface ProjectPitch {
	id: string
	title: string
	story?: string | null
	pitchDeck?: string | null
	videoUrl?: string | null
}

export interface TeamMember {
	id: string
	name: string
	avatar: string
	role: string
	bio: string
	isAdmin: boolean
	isEditor: boolean
}

export type MilestoneStatus =
	| 'pending'
	| 'completed'
	| 'approved'
	| 'rejected'
	| 'disputed'

export interface Milestone {
	id: string
	title: string
	description: string
	amount: number
	deadline: string
	status: MilestoneStatus
	index: number
}

export interface Update {
	id: string
	title: string
	content: string
	author: {
		id: string
		name: string
		avatar: string
	}
	date: string
	comments: Comment[]
}

export interface Comment {
	id: string
	content: string
	author: {
		id: string
		name: string
		avatar: string
	}
	date: string
	type?: 'question' | 'answer' | 'general'
	parentId?: string
	like: number
}

export interface PitchFile {
	id: string
	name: string
	type: 'pdf' | 'ppt' | 'pptx' | 'key' | 'odp'
	url: string
	size: number
}
