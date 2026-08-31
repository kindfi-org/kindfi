import type { LucideIcon } from 'lucide-react'
import { cn } from '~/lib/utils'

interface SectionHeaderProps {
	icon?: LucideIcon
	iconClassName?: string
	title: string
	description?: string
	children?: React.ReactNode
	className?: string
}

export function SectionHeader({
	icon: Icon,
	iconClassName,
	title,
	description,
	children,
	className,
}: SectionHeaderProps) {
	return (
		<div
			className={cn('flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between', className)}
		>
			<div className="flex items-center gap-3">
				{Icon ? (
					<div
						className={cn(
							'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700',
							iconClassName,
						)}
					>
						<Icon className="h-5 w-5" aria-hidden="true" />
					</div>
				) : null}
				<div>
					<h2 className="text-xl font-bold tracking-tight text-gray-900">{title}</h2>
					{description ? (
						<p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
					) : null}
				</div>
			</div>
			{children ? <div className="mt-2 sm:mt-0">{children}</div> : null}
		</div>
	)
}
