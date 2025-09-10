import type { Enums } from '@services/supabase'
import type { EscrowType } from '@trustless-work/escrow'
import type { Project } from './'

export interface ProjectDetail extends Project {
	location: string
	socialLinks?: SocialLinks
	pitch: ProjectPitch
	team: TeamMember[]
	milestones: Milestone[]
	updates: Update[]
	comments: Comment[]
	/** Optional on-chain escrow contract address for this project */
	escrowContractAddress?: string
	/** Optional escrow type for this project's escrow */
	escrowType?: EscrowType
}

export interface SocialLinks {
	website?: string
	twitter?: string
	facebook?: string
	instagram?: string
	linkedin?: string
	github?: string
	youtube?: string
	telegram?: string
	discord?: string
	medium?: string
	tiktok?: string
}

export interface ProjectPitch {
	title: string
	story: string
	pitchDeck: string | null
	videoUrl: string | null
}

export interface TeamMember {
	id: string
	displayName: string | null
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
