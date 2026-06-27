/**
 * Single source of truth for project manage navigation.
 * Used by the command center and overview dashboard.
 */

export type ProjectManageSectionKey =
	| 'overview'
	| 'basics'
	| 'pitch'
	| 'highlights'
	| 'updates'
	| 'members'
	| 'escrow-setup'
	| 'escrow-manage'

export type ProjectManageNavSection = {
	key: ProjectManageSectionKey
	title: string
	description: string
	href: (slug: string) => string
	path: string
	/** How to match the active tab against pathname */
	match: 'exact' | 'prefix'
	cta: string
}

export const PROJECT_MANAGE_NAV_SECTIONS: ReadonlyArray<ProjectManageNavSection> = [
	{
		key: 'overview',
		title: 'Dashboard',
		description: 'Quick links and progress across content, team, and escrow.',
		href: (slug) => `/projects/${slug}/manage`,
		path: '',
		match: 'exact',
		cta: 'View dashboard',
	},
	{
		key: 'basics',
		title: 'Basics',
		description: 'Core details like name, category, location, and metadata.',
		href: (slug) => `/projects/${slug}/manage/basics`,
		path: '/basics',
		match: 'prefix',
		cta: 'Edit basics',
	},
	{
		key: 'pitch',
		title: 'Pitch',
		description: 'Your story, problem statement, solution, and roadmap.',
		href: (slug) => `/projects/${slug}/manage/pitch`,
		path: '/pitch',
		match: 'prefix',
		cta: 'Improve pitch',
	},
	{
		key: 'highlights',
		title: 'Highlights',
		description: 'Key achievements, traction and notable metrics.',
		href: (slug) => `/projects/${slug}/manage/highlights`,
		path: '/highlights',
		match: 'prefix',
		cta: 'Add highlights',
	},
	{
		key: 'updates',
		title: 'Updates',
		description: 'Post progress and news for supporters on your public project page.',
		href: (slug) => `/projects/${slug}/manage/updates`,
		path: '/updates',
		match: 'prefix',
		cta: 'Post update',
	},
	{
		key: 'members',
		title: 'Team',
		description: "Showcase who's behind this project and their contributions.",
		href: (slug) => `/projects/${slug}/manage/members`,
		path: '/members',
		match: 'prefix',
		cta: 'Manage team',
	},
	{
		key: 'escrow-setup',
		title: 'Escrow setup',
		description:
			'Step-by-step setup for your Trustless Work escrow contract, roles, and milestones.',
		href: (slug) => `/projects/${slug}/manage/settings`,
		path: '/settings',
		match: 'exact',
		cta: 'Create escrow',
	},
	{
		key: 'escrow-manage',
		title: 'Escrow ops',
		description: 'Fund the contract, approve milestones, and release payments step by step.',
		href: (slug) => `/projects/${slug}/manage/settings/manage`,
		path: '/settings/manage',
		match: 'prefix',
		cta: 'Manage escrow',
	},
] as const

export const isProjectManageNavActive = (
	pathname: string,
	basePath: string,
	section: ProjectManageNavSection,
): boolean => {
	const fullPath = `${basePath}${section.path}`

	if (section.path === '') {
		return pathname === basePath
	}

	if (section.match === 'exact') {
		return pathname === fullPath
	}

	return pathname.startsWith(fullPath)
}
