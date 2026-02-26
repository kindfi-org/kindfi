import {
	IoCreateOutline,
	IoLockClosedOutline,
	IoMegaphoneOutline,
	IoPeopleOutline,
	IoSettingsOutline,
	IoStarOutline,
} from 'react-icons/io5'
import type {
	CategoryConfig,
	ManageSection,
} from '~/lib/types/project/manage.types'

export const manageSections: ManageSection[] = [
	{
		title: 'Basics',
		description: 'Core details like name, category, location, and metadata.',
		href: 'basics',
		cta: 'Edit basics',
		Icon: IoCreateOutline,
		category: 'content',
	},
	{
		title: 'Pitch',
		description: 'Your story, problem statement, solution, and roadmap.',
		href: 'pitch',
		cta: 'Improve pitch',
		Icon: IoMegaphoneOutline,
		category: 'content',
	},
	{
		title: 'Highlights',
		description: 'Key achievements, traction and notable metrics.',
		href: 'highlights',
		cta: 'Add highlights',
		Icon: IoStarOutline,
		category: 'content',
	},
	{
		title: 'Project Team',
		description: "Showcase who's behind this project and their contributions.",
		href: 'members',
		cta: 'Manage team',
		Icon: IoPeopleOutline,
		category: 'team',
	},
	{
		title: 'Escrow Creation',
		description:
			'Initialize and configure your escrow contract, roles, and milestones.',
		href: 'settings',
		cta: 'Create escrow',
		Icon: IoSettingsOutline,
		category: 'escrow',
	},
	{
		title: 'Escrow Management',
		description:
			'Fund escrow, approve milestones, release funds, and track balance.',
		href: 'settings/manage',
		cta: 'Manage escrow',
		Icon: IoLockClosedOutline,
		category: 'escrow',
	},
] as const

export const manageCategoryConfig: Record<
	ManageSection['category'],
	CategoryConfig
> = {
	content: {
		label: 'Content',
		color:
			'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900',
		gradient:
			'from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20',
		iconGradient: 'from-blue-500 to-indigo-600',
		accent: 'blue',
	},
	team: {
		label: 'Team',
		color:
			'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900',
		gradient:
			'from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20',
		iconGradient: 'from-purple-500 to-pink-600',
		accent: 'purple',
	},
	escrow: {
		label: 'Escrow',
		color:
			'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900',
		gradient:
			'from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20',
		iconGradient: 'from-green-500 to-emerald-600',
		accent: 'green',
	},
} as const
