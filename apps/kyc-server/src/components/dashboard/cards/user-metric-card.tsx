import type { LucideIcon } from 'lucide-react'

import { Badge } from '~/components/base/badge'
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { cn } from '~/lib/utils'

interface UserMetricCardProps {
	title: string
	value: number
	trendValue: number
	isPositive: boolean
	icon?: LucideIcon
	text: string
	description: string
	iconColor?: string
	className?: string
}

export function UserMetricCard({
	title,
	value,
	trendValue,
	isPositive,
	icon: Icon,
	iconColor = 'text-primary',
	text,
	description,
	className,
}: UserMetricCardProps) {
	return (
		<Card className={cn('@container/card', className)} data-slot="card">
			<CardHeader className="relative">
				<CardDescription>{title}</CardDescription>
				<CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
					{value.toLocaleString()}
				</CardTitle>
				<div className="absolute right-4 top-4">
					<Badge
						variant="outline"
						className={cn(
							'flex gap-1 rounded-lg text-xs',
							isPositive ? 'text-green-600' : 'text-red-600',
						)}
						aria-label={`Trend: ${isPositive ? 'positive' : 'negative'} ${trendValue.toFixed(1)}%`}
					>
						{isPositive ? '+' : '-'}
						{Math.abs(trendValue).toFixed(1)}%
					</Badge>
				</div>
			</CardHeader>
			<CardFooter className="flex-col items-start gap-1 text-sm">
				<div className="line-clamp-1 flex gap-2 font-medium">
					{Icon && (
						<Icon className={cn('size-4', iconColor)} aria-hidden="true" />
					)}
					{text}
				</div>
				<div className="text-muted-foreground">{description}</div>
			</CardFooter>
		</Card>
	)
}