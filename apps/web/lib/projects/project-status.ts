import type { Enums } from '@services/supabase'

export type ProjectStatus = Enums<'project_status'>

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
	draft: 'Draft',
	review: 'Ready for review',
	active: 'Active',
	paused: 'Paused',
	funded: 'Complete',
	rejected: 'Rejected',
}

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
	draft: 'bg-gray-100 text-gray-800 border-gray-200',
	review: 'bg-yellow-100 text-yellow-800 border-yellow-200',
	active: 'bg-green-100 text-green-800 border-green-200',
	paused: 'bg-orange-100 text-orange-800 border-orange-200',
	funded: 'bg-blue-100 text-blue-800 border-blue-200',
	rejected: 'bg-red-100 text-red-800 border-red-200',
}

/** Statuses managers can submit to signal campaign readiness. */
export const MANAGER_SUBMITTABLE_STATUSES: ReadonlyArray<ProjectStatus> = ['draft', 'rejected']

/** Admin-facing status actions on the manage dashboard. */
export function getAdminStatusActions(currentStatus: ProjectStatus): Array<{
	status: ProjectStatus
	label: string
	variant?: 'default' | 'outline' | 'destructive' | 'secondary'
}> {
	const actions: Array<{
		status: ProjectStatus
		label: string
		variant?: 'default' | 'outline' | 'destructive' | 'secondary'
	}> = [
		{ status: 'active', label: 'Mark as active', variant: 'default' },
		{ status: 'funded', label: 'Mark as complete', variant: 'secondary' },
		{ status: 'paused', label: 'Mark as paused', variant: 'outline' },
		{ status: 'rejected', label: 'Mark as rejected', variant: 'destructive' },
		{
			status: 'review',
			label: currentStatus === 'draft' ? 'Mark as ready for review' : 'Send back to review',
			variant: 'outline',
		},
		{ status: 'draft', label: 'Revert to draft', variant: 'outline' },
	]

	return actions.filter((action) => action.status !== currentStatus)
}

export function canManagerSubmitForReview(status: ProjectStatus): boolean {
	return MANAGER_SUBMITTABLE_STATUSES.includes(status)
}

export function isAllowedStatusTransition(params: {
	from: ProjectStatus
	to: ProjectStatus
	isPlatformAdmin: boolean
}): boolean {
	const { from, to, isPlatformAdmin } = params
	if (from === to) return false

	if (isPlatformAdmin) {
		return true
	}

	// Project managers can only mark the campaign ready for admin review.
	return canManagerSubmitForReview(from) && to === 'review'
}
