import type { ReactNode } from 'react'
import { cn } from '~/lib/utils'

type ManageSectionHeaderProps = {
	title: string
	description?: string
	actions?: ReactNode
	className?: string
}

/**
 * Shared page title for manage subsections — quiet product chrome under the command center.
 */
export function ManageSectionHeader({
	title,
	description,
	actions,
	className,
}: ManageSectionHeaderProps) {
	return (
		<div
			className={cn('flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between', className)}
		>
			<div className="min-w-0 space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
					{title}
				</h1>
				{description ? (
					<p className="max-w-2xl text-sm text-muted-foreground sm:text-base">{description}</p>
				) : null}
			</div>
			{actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
		</div>
	)
}
