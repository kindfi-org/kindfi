/**
 * Single source of truth for project manage navigation.
 * Used by the command center and overview dashboard.
 */

export type ProjectManageSectionKey =
	| 'overview'
	| 'content'
	| 'updates'
	| 'members'
	| 'milestones'
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
	/** Escrow sections are platform-admin only */
	adminOnly?: boolean
	/** Only shown when the project has an active escrow contract */
	requiresEscrow?: boolean
}

export const PROJECT_MANAGE_NAV_SECTIONS: ReadonlyArray<ProjectManageNavSection> = [
	{
		key: 'overview',
		title: 'Dashboard',
		description: 'Quick links and progress across content and team.',
		href: (slug) => `/projects/${slug}/manage`,
		path: '',
		match: 'exact',
		cta: 'View dashboard',
	},
	{
		key: 'content',
		title: 'Content setup',
		description: 'Guided bilingual setup for basics, story, and campaign impact.',
		href: (slug) => `/projects/${slug}/manage/content`,
		path: '/content',
		match: 'prefix',
		cta: 'Set up content',
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
		key: 'milestones',
		title: 'Releases',
		description: 'Request admin review when a release is ready.',
		href: (slug) => `/projects/${slug}/manage/milestones`,
		path: '/milestones',
		match: 'prefix',
		cta: 'Request review',
		requiresEscrow: true,
	},
	{
		key: 'escrow-setup',
		title: 'Escrow setup',
		description: 'Step-by-step setup for your Trustless Work escrow contract, roles, and releases.',
		href: (slug) => `/projects/${slug}/manage/settings`,
		path: '/settings',
		match: 'exact',
		cta: 'Create escrow',
		adminOnly: true,
	},
	{
		key: 'escrow-manage',
		title: 'Escrow ops',
		description: 'Fund the contract, approve releases, and disburse payments step by step.',
		href: (slug) => `/projects/${slug}/manage/settings/manage`,
		path: '/settings/manage',
		match: 'prefix',
		cta: 'Manage escrow',
		adminOnly: true,
	},
] as const

export const getProjectManageNavSections = (
	isPlatformAdmin: boolean,
	hasEscrow = false,
): ReadonlyArray<ProjectManageNavSection> => {
	return PROJECT_MANAGE_NAV_SECTIONS.filter((section) => {
		if (section.adminOnly && !isPlatformAdmin) return false
		if (section.requiresEscrow && !hasEscrow) return false
		return true
	})
}

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
