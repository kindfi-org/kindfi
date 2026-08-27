import type { LucideIcon } from 'lucide-react'
import { cn } from '~/lib/utils'
import { ProfileSurfaceCard } from '../profile-surface-card'
import type { StatusVariant } from './status-badge'
import { StatusBadge } from './status-badge'

interface ActionCardProps {
	icon?: LucideIcon
	iconClassName?: string
	title: string
	description?: string
	status?: { variant: StatusVariant; label: string }
	children?: React.ReactNode
	className?: string
	padding?: 'sm' | 'md' | 'lg'
}

export function ActionCard({
	icon: Icon,
	iconClassName,
	title,
	description,
	status,
	children,
	className,
	padding = 'md',
}: ActionCardProps) {
	return (
		<ProfileSurfaceCard padding={padding} className={cn('flex flex-col gap-4', className)}>
			<div className="flex items-start justify-between gap-3">
				<div className="flex items-start gap-3">
					{Icon ? (
						<div
							className={cn(
								'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600',
								iconClassName,
							)}
						>
							<Icon className="h-5 w-5" aria-hidden="true" />
						</div>
					) : null}
					<div className="min-w-0 space-y-0.5">
						<h3 className="text-base font-semibold text-gray-900">{title}</h3>
						{description ? (
							<p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
						) : null}
					</div>
				</div>
				{status ? <StatusBadge variant={status.variant} label={status.label} /> : null}
			</div>
			{children ? <div className="flex flex-col gap-3">{children}</div> : null}
		</ProfileSurfaceCard>
	)
}
