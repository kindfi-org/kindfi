import {
	Contribute,
	ExploreDetails,
	ExploreProject,
} from '~/components/icons/illustrations'
import { type GuideStep, StepNumber } from '~/lib/types'

export const steps: GuideStep[] = [
	{
		stepNumber: StepNumber.EXPLORE,
		title: 'Explore Available Projects',
		description:
			'Browse through a wide range of impactful projects across various categories. Each project provides detailed information to help you make well-informed decisions.',
		Icon: ExploreProject,
		imageAlt: 'Illustration of exploring projects',
	},
	{
		stepNumber: StepNumber.DISCOVER,
		title: 'Discover Project Details',
		description:
			'Dive into all the key details about each project, including financial goals, progress, and insights about the team behind the idea.',
		Icon: ExploreDetails,
		imageAlt: 'Illustration of reviewing project details',
	},
	{
		stepNumber: StepNumber.SUPPORT,
		title: 'Support What Inspires You',
		description:
			'Choose the projects that resonate with you the most and decide how much you want to contribute or invest. Support initiatives that align with your values and vision.',
		Icon: Contribute,
		imageAlt: 'Illustration of investing or contributing',
	},
]
