import type { LucideIcon } from 'lucide-react'
import { cn } from '~/lib/utils'

interface FormSectionHeaderProps {
	icon: LucideIcon
	title: string
	description?: string
	optional?: boolean
	optionalLabel?: string
	className?: string
}

export function FormSectionHeader({
	icon: Icon,
	title,
	description,
	optional = false,
	optionalLabel = 'Optional',
	className,
}: FormSectionHeaderProps) {
	return (
		<div className={cn('space-y-1 border-b border-slate-100 pb-4', className)}>
			<div className="flex items-center gap-2.5">
				<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
					<Icon className="h-4 w-4" aria-hidden="true" />
				</div>
				<div className="min-w-0 flex-1">
					<h3 className="text-base font-semibold tracking-tight text-slate-900">{title}</h3>
					{description ? (
						<p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
					) : null}
				</div>
				{optional ? (
					<span className="shrink-0 text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
						{optionalLabel}
					</span>
				) : null}
			</div>
		</div>
	)
}
