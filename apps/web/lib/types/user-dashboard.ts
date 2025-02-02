import type { ReactNode } from 'react'

export interface ProjectTag {
	id: string
	text: string
}

export interface ProjectDetails {
	id: string
	image: string
	category: string
	title: string
	description: string
	currentAmount: number
	targetAmount: number
	investors: number
	minInvestment: number
	percentageComplete: number
	tags: ProjectTag[]
}

export interface ImpactMetricItem {
	label: string
	value: string
	icon: ReactNode
}
