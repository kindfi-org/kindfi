import type { ReactNode } from 'react'

export interface ImpactMetric {
	label: string
	value: string
	icon: ReactNode
}

export interface ProjectTag {
	id: string
	text: string
}

export interface Project {
	id: string
	image_url: string
	categories: string[]
	title: string
	description: string
	current_amount: number
	target_amount: number
	investors_count: number
	min_investment: number
	created_at: string
	percentage_complete: number
	tags: ProjectTag[]
}
