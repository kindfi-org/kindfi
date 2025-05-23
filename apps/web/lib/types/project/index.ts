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
	description: string | null
	image: string | null
	createdAt: string | null
	category: Tables<'categories'> | null
	goal: number
	raised: number
	investors: number
	minInvestment: number
	tags: Tag[]
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
