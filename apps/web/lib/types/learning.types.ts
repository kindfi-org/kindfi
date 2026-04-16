import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export interface Category {
	name: string
	description: string
	icon: LucideIcon
	slug: string
	type: 'crowdfunding' | 'blockchain' | 'web3' | 'security'
}

export interface Resource {
	id: number
	title: string
	description: string
	category: string
	type: string
	level: string
	duration: string
	engagement: {
		likes: number
		comments: number
	}
	image: string
	featured?: boolean
}

export interface NewsUpdate {
	tags: string[]
	description: ReactNode
	/** Omitted when the post has no cover image (card shows accent bar instead). */
	image?: string
	slug: string
	id: number
	title: string
	date: string
	category: string
}
