import type { InvestorContent } from './types'

export const investorContent: InvestorContent = {
	title: {
		main: 'New in KindFi?',
		highlight: 'Support Verified Projects Today!',
	},
	description:
		'In just 3 simple steps, you can begin contributing to social initiatives securely and transparently.',
	steps: [
		{
			stepNumber: 1,
			title: 'Explore Available Projects',
			description:
				'Browse through a wide range of impactful projects across various categories. Each project provides detailed information to help you make well-informed decisions.',
			Icon: 'ExploreProject',
			imageAlt: 'Illustration of exploring projects',
		},
		{
			stepNumber: 2,
			title: 'Discover Project Details',
			description:
				'Dive into all the key details about each project, including financial goals, progress, and insights about the team behind the idea.',
			Icon: 'ExploreDetails',
			imageAlt: 'Illustration of reviewing project details',
		},
		{
			stepNumber: 3,
			title: 'Support What Inspires You',
			description:
				'Choose the projects that resonate with you the most and decide how much you want to contribute or invest. Support initiatives that align with your values and vision.',
			Icon: 'Contibute',
			imageAlt: 'Illustration of investing or contributing',
		},
	],
}
