import type { Enums } from '../database.types'
import type { Project } from './'

export interface ProjectDetail extends Project {
	pitch: ProjectPitch
	team: TeamMember[]
	milestones: Milestone[]
	updates: Update[]
	comments: Comment[]
}

export interface ProjectPitch {
	id: string
	title: string
	story: string | null
	pitchDeck: string | null
	videoUrl: string | null
}

export interface TeamMember {
	id: string
	displayName: string
	avatar: string | null
	bio: string | null
	role: Enums<'project_member_role'>
	title: string
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
	description: string | null
	amount: number
	deadline: string
	status: MilestoneStatus
	orderIndex: number
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
	type: Enums<'comment_type'>
	parentId?: string
	like: number
}
