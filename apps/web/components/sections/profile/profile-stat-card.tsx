import type { LucideIcon } from 'lucide-react'
import { cn } from '~/lib/utils'
import { ProfileSurfaceCard } from './profile-surface-card'

interface ProfileStatCardProps {
	label: string
	value: string
	icon?: LucideIcon
	trend?: string
	className?: string
}

export function ProfileStatCard({
	label,
	value,
	icon: Icon,
	trend,
	className,
}: ProfileStatCardProps) {
	return (
		<ProfileSurfaceCard padding="sm" className={cn('h-full', className)}>
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0 space-y-2">
					<p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
						{label}
					</p>
					<p className="text-2xl font-bold tabular-nums tracking-tight text-gray-900 sm:text-3xl">
						{value}
					</p>
					{trend ? (
						<p className="text-xs text-muted-foreground">{trend}</p>
					) : null}
				</div>
				{Icon ? (
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
						<Icon className="h-5 w-5" />
					</div>
				) : null}
			</div>
		</ProfileSurfaceCard>
	)
}
