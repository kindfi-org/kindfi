import type { ComponentType } from 'react'

export type ManageSectionCategory = 'content' | 'team' | 'escrow'

export interface ManageSection {
	title: string
	description: string
	href: string
	cta: string
	Icon: ComponentType<{ size?: number; className?: string }>
	category: ManageSectionCategory
}

export interface CategoryConfig {
	label: string
	color: string
	gradient: string
	iconGradient: string
	accent: string
}

export interface SectionCardProps extends ManageSection {
	slug: string
	categoryConfig: CategoryConfig
	cardVariants: {
		hidden: { opacity: number; y: number }
		show: {
			opacity: number
			y: number
			transition:
				| { duration: number }
				| {
						type: string
						stiffness: number
						damping: number
				  }
		}
	}
}
