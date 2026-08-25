import { Badge } from '~/components/base/badge'
import { cn } from '~/lib/utils'

export type AdminStatusKind = 'project' | 'escrow' | 'kyc' | 'review' | 'role' | 'priority'

interface StatusStyle {
	label: string
	className: string
}

/**
 * Single source of truth for admin status presentation. Every badge renders
 * a text label (status never relies on color alone) with a consistent color
 * treatment across projects, escrows, KYC, milestone reviews, and roles.
 */
const STATUS_STYLES: Record<AdminStatusKind, Record<string, StatusStyle>> = {
	project: {
		draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800' },
		review: { label: 'In review', className: 'bg-yellow-100 text-yellow-800' },
		active: { label: 'Active', className: 'bg-green-200 text-green-800' },
		paused: { label: 'Paused', className: 'bg-orange-100 text-orange-800' },
		funded: { label: 'Funded', className: 'bg-purple-100 text-purple-800' },
		rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
	},
	escrow: {
		NEW: { label: 'New', className: 'bg-gray-100 text-gray-800' },
		FUNDED: { label: 'Funded', className: 'bg-blue-100 text-blue-800' },
		ACTIVE: { label: 'Active', className: 'bg-green-200 text-green-800' },
		COMPLETED: { label: 'Completed', className: 'bg-purple-100 text-purple-800' },
		DISPUTED: { label: 'Disputed', className: 'bg-red-100 text-red-800' },
		CANCELLED: { label: 'Cancelled', className: 'bg-orange-100 text-orange-800' },
		none: { label: 'No escrow', className: 'bg-gray-100 text-gray-600' },
	},
	kyc: {
		not_started: { label: 'KYC not started', className: 'bg-gray-100 text-gray-600' },
		pending: { label: 'KYC pending', className: 'bg-yellow-100 text-yellow-800' },
		approved: { label: 'KYC approved', className: 'bg-green-200 text-green-800' },
		verified: { label: 'KYC verified', className: 'bg-green-200 text-green-800' },
		rejected: { label: 'KYC rejected', className: 'bg-red-100 text-red-800' },
		unknown: { label: 'KYC unknown', className: 'bg-orange-100 text-orange-800' },
	},
	review: {
		pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
		approved: { label: 'Approved', className: 'bg-green-200 text-green-800' },
		rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
	},
	role: {
		admin: { label: 'Admin', className: 'bg-red-100 text-red-800' },
		creator: { label: 'Creator', className: 'bg-purple-100 text-purple-800' },
		donor: { label: 'Donor', className: 'bg-blue-100 text-blue-800' },
		kinder: { label: 'Kinder', className: 'bg-green-200 text-green-800' },
		kindler: { label: 'Kindler', className: 'bg-yellow-100 text-yellow-800' },
		pending: { label: 'Pending', className: 'bg-gray-100 text-gray-800' },
	},
	priority: {
		high: { label: 'High priority', className: 'bg-red-100 text-red-800' },
		medium: { label: 'Medium priority', className: 'bg-yellow-100 text-yellow-800' },
		low: { label: 'Low priority', className: 'bg-gray-100 text-gray-700' },
	},
}

const FALLBACK_STYLE: StatusStyle = { label: 'Unknown', className: 'bg-gray-100 text-gray-800' }

export function getAdminStatusLabel(kind: AdminStatusKind, status: string): string {
	return STATUS_STYLES[kind][status]?.label ?? status
}

interface AdminStatusBadgeProps {
	kind: AdminStatusKind
	status: string
	className?: string
}

export function AdminStatusBadge({ kind, status, className }: AdminStatusBadgeProps) {
	const style = STATUS_STYLES[kind][status] ?? { ...FALLBACK_STYLE, label: status }
	return (
		<Badge variant="outline" className={cn('border-transparent', style.className, className)}>
			{style.label}
		</Badge>
	)
}
