import type { Enums } from '@services/supabase'
import {
	PROJECT_MANAGE_NAV_SECTIONS,
	type ProjectManageSectionKey,
} from '~/components/sections/projects/manage/constants'

export interface AdminAction {
	label: string
	href: string
}

/**
 * Resolves a project-manage section href from the existing navigation source
 * of truth, so admin surfaces always route into the same escrow-setup and
 * escrow-manage workspaces the project command center uses.
 */
export function projectManageSectionHref(key: ProjectManageSectionKey, slug: string): string {
	const section = PROJECT_MANAGE_NAV_SECTIONS.find((entry) => entry.key === key)
	if (!section) return `/projects/${slug}/manage`
	return section.href(slug)
}

/**
 * State-driven primary action for a project in admin surfaces.
 */
export function getProjectPrimaryAction(project: {
	status: Enums<'project_status'>
	slug: string | null
	hasEscrow: boolean
}): AdminAction {
	const slug = project.slug ?? ''
	const manageHref = projectManageSectionHref('overview', slug)

	switch (project.status) {
		case 'draft':
			return { label: 'View setup', href: manageHref }
		case 'review':
			return { label: 'Review project', href: manageHref }
		case 'active':
			return project.hasEscrow
				? { label: 'Manage escrow', href: projectManageSectionHref('escrow-manage', slug) }
				: { label: 'Create escrow', href: projectManageSectionHref('escrow-setup', slug) }
		case 'paused':
			return { label: 'Review campaign', href: manageHref }
		case 'funded':
			return { label: 'View campaign', href: `/projects/${slug}` }
		case 'rejected':
			return { label: 'View project', href: manageHref }
		default:
			return { label: 'View project', href: manageHref }
	}
}
