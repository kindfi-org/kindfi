import type React from 'react'
import type { SvgProps } from 'react-native-svg'

// Enum for step numbers
export enum StepNumber {
	EXPLORE = 1,
	DISCOVER = 2,
	SUPPORT = 3,
}

// Interface for step data
export interface GuideStep {
	stepNumber: StepNumber
	title: string
	description: string
	Icon: React.FC<SvgProps>
	imageAlt: string
}

import {
	Contribute,
	ExploreDetails,
	ExploreProject,
} from '@/components/icons/illustrations'

// The steps data array
export const steps: GuideStep[] = [
	{
		stepNumber: StepNumber.EXPLORE,
		title: 'Explore Available Projects',
		description:
			'Browse through real, verified causes from across Latin America and beyond like education, clean water, animal rescue, and more. Each project includes clear info so you know exactly what your support is going toward.',
		Icon: ExploreProject,
		imageAlt: 'Illustration of exploring projects',
	},
	{
		stepNumber: StepNumber.DISCOVER,
		title: 'Learn About the Cause',
		description:
			'Read about who is behind the project, their goals, and how they plan to use the funds. Every project has milestones that must be verified before funds are released so your support is always secure.',
		Icon: ExploreDetails,
		imageAlt: 'Illustration of reviewing project details',
	},
	{
		stepNumber: StepNumber.SUPPORT,
		title: 'Support What Matters to You',
		description:
			'When you find a cause that speaks to you, choose how much to contribute and send support directly from your crypto wallet. Your contribution stays safe in escrow until the project proves its progress.',
		Icon: Contribute,
		imageAlt: 'Illustration of investing or contributing',
	},
]
