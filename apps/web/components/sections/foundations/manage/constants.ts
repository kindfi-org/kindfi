/**
 * Single source of truth for foundation manage section links.
 * Used by navigation and overview to avoid duplication.
 */

export type FoundationManageSectionKey = 'overview' | 'edit' | 'campaigns' | 'members'

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
		description: 'Stats, mission, vision, and quick links to manage your foundation.',
		href: (slug: string) => `/foundations/${slug}/manage`,
		path: '',
		cta: 'View Dashboard',
	},
	{
		key: 'edit',
		title: 'Edit foundation',
		description: 'Update name, description, story, impact, mission, vision, and logo.',
		href: (slug: string) => `/foundations/${slug}/manage/edit`,
		path: '/edit',
		cta: 'Edit foundation',
	},
	{
		key: 'campaigns',
		title: 'Campaigns',
		description: 'Create and assign campaigns linked to this foundation.',
		href: (slug: string) => `/foundations/${slug}/manage/campaigns`,
		path: '/campaigns',
		cta: 'Manage Campaigns',
	},
	{
		key: 'members',
		title: 'Team members',
		description: 'Add and remove team members who represent your foundation.',
		href: (slug: string) => `/foundations/${slug}/manage/members`,
		path: '/members',
		cta: 'Manage team',
	},
]
