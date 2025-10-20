import type { Tables } from '@services/supabase'
import type { ReactNode } from 'react'

export interface Tag {
	id: string
	name: string
	color: string
}

export interface Project {
	id: string
	title: string
	slug: string | null
	description: string
	image: string | null
	createdAt: string | null
	category: Tables<'categories'>
	goal: number
	raised: number
	investors: number
	minInvestment: number
	tags: Tag[]
	/** Optional on-chain escrow contract address for this project */
	escrowContractAddress?: string
}

export type SortOption =
	| 'Most Popular'
	| 'Most Funded'
	| 'Most Recent'
	| 'Most Supporters'

export type SortSlug =
	| 'most-popular'
	| 'most-funded'
	| 'most-recent'
	| 'most-supporters'

export interface SortOptionItem {
	value: SortOption
	label: string
	icon: ReactNode
}

export type {
	CommentData,
	CommentWithAnswers,
	CommentWithReplies,
	UserData,
} from './project-qa.types'
