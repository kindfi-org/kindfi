import {
	IoDocumentTextOutline,
	IoLockClosedOutline,
	IoNewspaperOutline,
	IoPeopleOutline,
	IoSettingsOutline,
} from 'react-icons/io5'
import type { CategoryConfig, ManageSection } from '~/lib/types/project/manage.types'

/** Legacy section list — prefer PROJECT_MANAGE_NAV_SECTIONS for new UI. Kept for category config. */
export const manageSections: ManageSection[] = [
	{
		title: 'Content setup',
		description: 'Guided bilingual setup for basics, story, and campaign impact.',
		href: 'content',
		cta: 'Set up content',
		Icon: IoDocumentTextOutline,
		category: 'content',
	},
	{
		title: 'Updates',
		description: 'Post progress and news for supporters on your public project page.',
		href: 'updates',
		cta: 'Post update',
		Icon: IoNewspaperOutline,
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
		description: 'Step-by-step setup for your Trustless Work escrow contract, roles, and releases.',
		href: 'settings',
		cta: 'Create escrow',
		Icon: IoSettingsOutline,
		category: 'escrow',
	},
	{
		title: 'Escrow Management',
		description: 'Fund the contract, approve releases, and disburse payments step by step.',
		href: 'settings/manage',
		cta: 'Manage escrow',
		Icon: IoLockClosedOutline,
		category: 'escrow',
	},
] as const

export const manageCategoryConfig: Record<ManageSection['category'], CategoryConfig> = {
	content: {
		label: 'Content',
		color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900',
		gradient: 'from-blue-50/50 to-transparent dark:from-blue-950/10 dark:to-transparent',
		iconGradient: 'from-blue-500 to-blue-600',
		accent: 'blue',
	},
	team: {
		label: 'Team',
		color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900',
		gradient: 'from-blue-50/50 to-transparent dark:from-blue-950/10 dark:to-transparent',
		iconGradient: 'from-blue-500 to-blue-600',
		accent: 'blue',
	},
	escrow: {
		label: 'Escrow',
		color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900',
		gradient: 'from-blue-50/50 to-transparent dark:from-blue-950/10 dark:to-transparent',
		iconGradient: 'from-blue-500 to-blue-600',
		accent: 'blue',
	},
} as const
