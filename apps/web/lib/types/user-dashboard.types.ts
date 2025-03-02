import type { ReactNode } from 'react'
import type { Tag } from '~/components/shared/project-card'

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
	tags: Tag[] | string[]
}

export interface ImpactMetric {
	label: string
	value: string
	icon: ReactNode
}
