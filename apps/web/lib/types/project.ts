import type { ReactNode } from 'react'

/** Custom type for percentage values between 0-100 */
type Percentage = number & { readonly __brand: 'percentage' }

/** Helper function to validate and create percentage values */
function createPercentage(value: number): Percentage {
	if (value < 0 || value > 100) {
		throw new Error('Percentage must be between 0 and 100')
	}
	return value as Percentage
}

/** Interface representing a project tag */
export interface ProjectTag {
	/** Unique identifier for the tag */
	id: string
	/** Display text for the tag */
	text: string
}

/** Interface representing a project category */
export interface ProjectCategory {
	/** Unique identifier for the category */
	id: string
	/** Icon component for the category */
	icon: ReactNode
	/** Display label for the category */
	label: string
	/** Tailwind CSS color classes for styling */
	color: string
}

/** Interface representing a project */
export interface Project {
	/** Unique identifier for the project */
	id: string
	/** Path to project image */
	image: string
	/** Reference to project category by ID */
	category: ProjectCategory['id']
	/** Project title */
	title: string
	/** Project description */
	description: string
	/** Current funding amount */
	currentAmount: number
	/** Target funding amount */
	targetAmount: number
	/** Number of investors */
	investors: number
	/** Minimum investment amount allowed */
	minInvestment: number
	/** Funding progress percentage (0-100) */
	percentageComplete: Percentage
	/** Project tags */
	tags: ProjectTag[]
}

export { createPercentage, type Percentage }
