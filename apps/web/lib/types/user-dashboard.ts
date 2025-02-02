import type { ReactNode } from 'react'


export interface Tag {
	id: string
	text: string
}


export interface Project {
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
	tags: Tag[]
}

export interface ImpactMetric {
	label: string
	value: string
	icon: ReactNode
}
