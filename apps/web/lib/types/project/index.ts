import type { ReactNode } from 'react'

export interface Project {
	id: string
	title: string
	description: string | null
	image: string | null
	createdAt: string | null
	category: Category | null
	goal: number
	raised: number
	investors: number
	minInvestment: number
	tags: string[]
}

export interface Category {
	id: string
	name: string
	slug: string | null
	color: string
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
