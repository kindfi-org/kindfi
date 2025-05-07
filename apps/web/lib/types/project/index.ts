import type { ReactNode } from 'react'

export interface Project {
	id: string
	title: string
	description: string
	image: string
	categoryId: string
	goal: number
	raised: number
	investors: number
	minInvestment: number
	tags: string[]
}

export interface Category {
	id: string
	name: string
	color: string
}

export type SortOption =
	| 'Most Popular'
	| 'Most Funded'
	| 'Most Recent'
	| 'Most Supporters'

export interface SortOptionItem {
	value: SortOption
	label: string
	icon: ReactNode
}
