import { Badge } from '~/components/base/badge'
import { cn } from '~/lib/utils'

export type StatusVariant =
	| 'verified'
	| 'pending'
	| 'rejected'
	| 'error'
	| 'not_started'
	| 'active'
	| 'inactive'
	| 'loading'

const variantClasses: Record<StatusVariant, string> = {
	verified: 'bg-emerald-50 text-emerald-800 hover:bg-emerald-50',
	active: 'bg-emerald-50 text-emerald-800 hover:bg-emerald-50',
	pending: 'bg-amber-50 text-amber-800 hover:bg-amber-50',
	rejected: 'bg-red-50 text-red-700 hover:bg-red-50',
	error: 'bg-orange-50 text-orange-700 hover:bg-orange-50',
	not_started: 'bg-slate-100 text-slate-700 hover:bg-slate-100',
	inactive: 'bg-slate-100 text-slate-700 hover:bg-slate-100',
	loading: 'bg-slate-100 text-slate-500 hover:bg-slate-100',
}

interface StatusBadgeProps {
	variant: StatusVariant
	label: string
	className?: string
}

export function StatusBadge({ variant, label, className }: StatusBadgeProps) {
	return (
		<Badge className={cn('rounded-full text-xs font-medium', variantClasses[variant], className)}>
			{label}
		</Badge>
	)
}
