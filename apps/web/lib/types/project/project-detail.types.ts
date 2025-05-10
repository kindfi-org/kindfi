import type { Project } from '.'

export interface ProjectDetail extends Project {
	owner: ProjectOwner
	description: string
	story: string
	pitchVideo?: string
	pitchFiles?: PitchFile[]
	team: TeamMember[]
	milestones: Milestone[]
	updates: Update[]
	comments: Comment[]
	createdAt: string
}

export interface ProjectOwner {
	id: string
	name: string
	avatar: string
	bio: string
	walletAddress: string
}

export interface TeamMember {
	id: string
	name: string
	avatar: string
	role: string
	isAdmin: boolean
	isEditor: boolean
}

export interface Milestone {
	id: string
	title: string
	description: string
	amount: number
	deadline: string
	status: 'completed' | 'in-progress' | 'upcoming'
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
	reactions?: {
		like: number
		heart: number
		celebrate: number
	}
}

export interface PitchFile {
	id: string
	name: string
	type: 'pdf' | 'ppt' | 'pptx' | 'key' | 'odp'
	url: string
	size: number
}

export type TabId = 'overview' | 'team' | 'milestones' | 'updates' | 'community'
