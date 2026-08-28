import type { LucideIcon } from 'lucide-react'
import { Button } from '~/components/base/button'
import { cn } from '~/lib/utils'

interface EmptyStateProps {
	icon?: LucideIcon
	title: string
	description?: string
	actionLabel?: string
	onAction?: () => void
	className?: string
}

export function EmptyState({
	icon: Icon,
	title,
	description,
	actionLabel,
	onAction,
	className,
}: EmptyStateProps) {
	return (
		<div
			className={cn(
				'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-10 text-center',
				className,
			)}
		>
			{Icon ? <Icon className="h-10 w-10 text-slate-300" aria-hidden="true" /> : null}
			<div className="space-y-1">
				<p className="text-sm font-medium text-gray-700">{title}</p>
				{description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
			</div>
			{actionLabel && onAction ? (
				<Button variant="outline" size="sm" onClick={onAction} className="mt-1 rounded-full">
					{actionLabel}
				</Button>
			) : null}
		</div>
	)
}
