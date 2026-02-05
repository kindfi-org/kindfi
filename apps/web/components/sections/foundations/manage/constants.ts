/**
 * Single source of truth for foundation manage section links.
 * Used by navigation and overview to avoid duplication.
 */

export type FoundationManageSectionKey =
	| 'overview'
	| 'edit'
	| 'campaigns'
	| 'milestones'
	| 'members'
	| 'settings'

export const FOUNDATION_MANAGE_SECTIONS: ReadonlyArray<{
	key: FoundationManageSectionKey
	title: string
	description: string
	href: (slug: string) => string
	path: string
	cta: string
}> = [
	{
		key: 'overview',
		title: 'Dashboard',
		description:
			'Stats, mission, vision, and quick links to manage your foundation.',
		href: (slug: string) => `/foundations/${slug}/manage`,
		path: '',
		cta: 'View Dashboard',
	},
	{
		key: 'edit',
		title: 'Edit foundation',
		description: 'Update name, description, mission, vision, and logo.',
		href: (slug: string) => `/foundations/${slug}/manage/edit`,
		path: '/edit',
		cta: 'Edit foundation',
	},
	{
		key: 'campaigns',
		title: 'Campaigns',
		description: 'Assign your campaigns to this foundation.',
		href: (slug: string) => `/foundations/${slug}/manage/campaigns`,
		path: '/campaigns',
		cta: 'Manage Campaigns',
	},
	{
		key: 'milestones',
		title: 'Milestones',
		description: 'Track and showcase your foundation’s key achievements.',
		href: (slug: string) => `/foundations/${slug}/manage/milestones`,
		path: '/milestones',
		cta: 'Manage Milestones',
	},
	{
		key: 'members',
		title: 'Members',
		description: 'View foundation founder and team information.',
		href: (slug: string) => `/foundations/${slug}/manage/members`,
		path: '/members',
		cta: 'View Members',
	},
	{
		key: 'settings',
		title: 'Escrow & Settings',
		description: 'Configure escrow contracts and foundation settings.',
		href: (slug: string) => `/foundations/${slug}/manage/settings`,
		path: '/settings',
		cta: 'Manage Settings',
	},
]
