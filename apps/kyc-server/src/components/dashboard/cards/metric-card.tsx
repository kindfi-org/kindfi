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

interface TrendData {
	value: number
	isPositive: boolean
	label: string
}

interface FooterData {
	icon: LucideIcon
	text: string
	description: string
}

interface MetricCardProps {
	title: string
	value: number
	description: string
	icon: LucideIcon
	iconColor?: string
	trend?: TrendData
	footer?: FooterData
	className?: string
}

export function MetricCard({
	title,
	value,
	description,
	icon: Icon,
	iconColor,
	trend,
	footer,
	className,
}: MetricCardProps) {
	return (
		<Card className={cn('@container/card', className)}>
			<CardHeader className="relative">
				<CardDescription>{title}</CardDescription>
				<CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
					{value.toLocaleString()}
				</CardTitle>
				{trend && (
					<div className="absolute right-4 top-4">
						<Badge
							variant="outline"
							className={cn(
								'flex gap-1 rounded-lg text-xs',
								trend.isPositive ? 'text-green-600' : 'text-red-600',
							)}
							aria-label={`Trend: ${trend.isPositive ? 'positive' : 'negative'} ${trend.value}%`}
						>
							{trend.isPositive ? '+' : ''}
							{trend.value}%
						</Badge>
					</div>
				)}
			</CardHeader>
			{footer && (
				<CardFooter className="flex-col items-start gap-1 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						<footer.icon
							className={cn('size-4', iconColor)}
							aria-hidden="true"
						/>
						{footer.text}
					</div>
					<div className="text-muted-foreground">{footer.description}</div>
				</CardFooter>
			)}
		</Card>
	)
}
