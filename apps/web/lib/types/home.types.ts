import type { ReactNode } from 'react'
/** Interface for category items in hero section */
export interface Category {
	/** Unique identifier for the category */
	id: string
	/** Icon component for the category */
	icon: ReactNode
	/** Display label for the category */
	label: string
	/** Tailwind CSS color classes for styling */
	color: string
}

export interface Stat {
	id: string
	value: string
	label: string
	icon: React.ReactNode
	highlight?: boolean
}

export interface Tag {
	id: string
	text: string
}

export interface JourneyStep {
	number: number
	title: string
	description: string
	active: boolean
	icon: React.ReactNode
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

export interface Feature {
	id: string
	icon: React.ReactNode
	title: string
	description: string
	highlight?: string
	stats?: {
		value: string
		label: string
	}
	checkList?: {
		id: string
		text: string
	}[]
}

export enum ModelVariant {
	SECURE = 'secure',
	SOCIAL = 'social',
	BLOCKCHAIN = 'blockchain',
}

export interface Capability {
	id: string
	text: string
}

export interface Model {
	id: string
	title: string
	description: string
	variant: ModelVariant
	icon: React.ReactNode
	capabilities: Capability[]
}

export enum StepNumber {
	EXPLORE = 1,
	DISCOVER = 2,
	SUPPORT = 3,
}

export interface GuideStep {
	stepNumber: StepNumber
	title: string
	description: string
	Icon: React.ComponentType
	imageAlt: string
}

export interface Benefit {
	id: string
	text: string
	icon: React.ReactNode
}

export interface TestimonialData {
	quote: string
	author: string
	role: string
	imageUrl: string
}

export interface SocialButtonProps {
	id: string
	icon: React.ReactNode
	provider: string
	onClick: () => void
	className: string
}

export interface BaseItem {
	id: string
	title: string
	description: string
	date: string
}

export interface TabItem {
	id: string
	label: string
	content: string
}

export interface StatItem {
	id: string
	label: string
	value: string
	bgColor: string
	textColor: string
	icon: string
}

export interface UpdateItem extends BaseItem {
	exclusive?: boolean
}

export interface TimelineEvent extends BaseItem {
	status: 'completed' | 'pending'
}

export interface MediaItem {
	id: string
	type: 'image' | 'video'
	src: string
	alt: string
}

export interface Highlight {
	id: string
	label: string
	value: string
	icon: string
}

export interface AboutProjectProps {
	id: string
	description: string
	highlights: Highlight[]
	updates: BaseItem[]
	titleAboveHighlights: boolean
}
