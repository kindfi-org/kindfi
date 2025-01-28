// apps/web/constants/sections/journey/data.ts
import type { JourneyContent } from './types'

export const journeyContent: JourneyContent = {
	title: {
		text: 'Transform Realities Using the',
		highlight: 'Power of the Web3',
	},
	description:
		'From creation to launch, follow a transparent and secure process powered by Smart Blockchain Escrows. Every step is verified to ensure the success of your social campaign.',
	toggleButtons: {
		project: 'Social Cause Path',
		investor: 'Supporter Path',
	},
	actionButtons: {
		project: 'Register Your Project',
		investor: 'Explore Causes',
	},
	projectSteps: [
		{
			number: 1,
			title: 'Project Registration',
			description:
				'Share the key details of your idea and set clear fundraising goals to kickstart your campaign.',
			active: true,
			icon: 'Rocket',
		},
		{
			number: 2,
			title: 'Review and Approval',
			description:
				'Our team evaluates the feasibility of your proposal to ensure transparency and maximize its potential for success.',
			active: false,
			icon: 'ChevronRight',
		},
		{
			number: 3,
			title: 'Campaign Preparation',
			description:
				'Refine and optimize your campaign to make it ready for an impactful launch on the platform.',
			active: false,
			icon: 'ChevronRight',
		},
		{
			number: 4,
			title: 'Launch and Promotion',
			description:
				'Bring your project to life by launching it for investors and start collecting contributions.',
			active: false,
			icon: 'ChevronRight',
		},
		{
			number: 5,
			title: 'Fund Reception',
			description:
				'Once your goal is reached, withdraw your funds and begin building your vision for the future.',
			active: false,
			icon: 'ChevronRight',
		},
	],
	investorSteps: [
		{
			number: 1,
			title: 'Explore Projects',
			description:
				'Browse a diverse range of projects aligned with your interests and values, and discover opportunities to make an impact.',
			active: true,
			icon: 'Users',
		},
		{
			number: 2,
			title: 'Analyze Project Details',
			description:
				'Access key information about each project, including objectives, progress, and potential impact.',
			active: false,
			icon: 'ChevronRight',
		},
		{
			number: 3,
			title: 'Contribute to Projects',
			description:
				'Choose the projects that resonate with you the most and make your contribution with ease.',
			active: false,
			icon: 'ChevronRight',
		},
		{
			number: 4,
			title: 'Real-Time Tracking',
			description:
				'Monitor project progress in real-time and receive regular updates on milestones and achievements.',
			active: false,
			icon: 'ChevronRight',
		},
		{
			number: 5,
			title: 'Rewards and Engagement',
			description:
				'Receive exclusive rewards like NFTs, tokens, or access to special activities as the projects you supported reach completion.',
			active: false,
			icon: 'ChevronRight',
		},
	],
}
