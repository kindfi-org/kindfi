import type { LucideIcon } from 'lucide-react'
import { cn } from '~/lib/utils'

interface StatItem {
	label: string
	value: string | number
	icon?: LucideIcon
	iconClassName?: string
}

interface StatSummaryProps {
	stats: StatItem[]
	className?: string
	cols?: 2 | 3 | 4
}

const colClasses = {
	2: 'grid-cols-2',
	3: 'grid-cols-2 sm:grid-cols-3',
	4: 'grid-cols-2 sm:grid-cols-4',
}

export function StatSummary({ stats, className, cols = 3 }: StatSummaryProps) {
	return (
		<div className={cn('grid gap-4', colClasses[cols], className)}>
			{stats.map((stat) => (
				<div
					key={stat.label}
					className="flex flex-col gap-1 rounded-xl border border-slate-100 bg-slate-50/60 p-3"
				>
					{stat.icon ? (
						<stat.icon
							className={cn('mb-1 h-4 w-4 text-slate-400', stat.iconClassName)}
							aria-hidden="true"
						/>
					) : null}
					<span className="text-xl font-bold text-gray-900">{stat.value}</span>
					<span className="text-xs text-muted-foreground">{stat.label}</span>
				</div>
			))}
		</div>
	)
}
