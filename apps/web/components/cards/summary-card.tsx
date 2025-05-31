import { Card, CardContent, CardHeader, CardTitle } from '../base/card'

type SummaryCardProps = {
	title: string
	value: string | number
	description?: string
	icon?: React.ReactNode
	trend?: 'up' | 'down' | 'neutral'
	trendValue?: string
	variant?: 'default' | 'primary' | 'secondary' | 'destructive'
}

export function SummaryCard({
	title,
	value,
	description,
	icon,
	trend,
	trendValue,
	variant = 'default',
}: SummaryCardProps) {
	const getVariantStyles = () => {
		switch (variant) {
			case 'primary':
				return {
					card: 'bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:border-primary/30',
					icon: 'text-primary bg-primary/10',
					value: 'text-primary',
					accent: 'bg-primary',
				}
			case 'secondary':
				return {
					card: 'bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20 hover:border-secondary/30',
					icon: 'text-secondary bg-secondary/10',
					value: 'text-secondary',
					accent: 'bg-secondary',
				}
			case 'destructive':
				return {
					card: 'bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20 hover:border-destructive/30',
					icon: 'text-destructive bg-destructive/10',
					value: 'text-destructive',
					accent: 'bg-destructive',
				}
			default:
				return {
					card: 'bg-card hover:bg-accent/30 border-border hover:border-border',
					icon: 'text-muted-foreground bg-muted',
					value: 'text-card-foreground',
					accent: 'bg-primary',
				}
		}
	}

	const getTrendIcon = () => {
		switch (trend) {
			case 'up':
				return <span className="text-primary">↗</span>
			case 'down':
				return <span className="text-destructive">↘</span>
			case 'neutral':
				return <span className="text-muted-foreground">→</span>
			default:
				return null
		}
	}

	const getTrendColor = () => {
		switch (trend) {
			case 'up':
				return 'text-primary'
			case 'down':
				return 'text-destructive'
			case 'neutral':
				return 'text-muted-foreground'
			default:
				return 'text-muted-foreground'
		}
	}

	const styles = getVariantStyles()

	return (
		<Card
			className={`relative overflow-hidden transition-all duration-200 hover:shadow-md group ${styles.card}`}
		>
			{/* Accent line */}
			<div
				className={`absolute top-0 left-0 right-0 h-1 ${styles.accent} opacity-60`}
			/>

			<CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-2">
				<div className="flex-1">
					<CardTitle className="text-sm font-medium text-muted-foreground leading-none">
						{title}
					</CardTitle>
				</div>
				{icon && (
					<div
						className={`p-2 rounded-lg transition-all duration-200 group-hover:scale-110 ${styles.icon}`}
					>
						<div className="w-4 h-4 flex items-center justify-center">
							{icon}
						</div>
					</div>
				)}
			</CardHeader>

			<CardContent className="p-4 pt-0">
				<div className="space-y-2">
					{/* Value with trend */}
					<div className="flex items-end gap-2">
						<div className={`text-2xl font-bold leading-none ${styles.value}`}>
							{value}
						</div>
						{trend && trendValue && (
							<div
								className={`flex items-center gap-1 text-sm font-medium ${getTrendColor()}`}
							>
								{getTrendIcon()}
								<span>{trendValue}</span>
							</div>
						)}
					</div>

					{/* Description */}
					{description && (
						<p className="text-xs text-muted-foreground leading-relaxed">
							{description}
						</p>
					)}
				</div>

				{/* Subtle background decoration */}
				<div className="absolute -bottom-2 -right-2 w-16 h-16 rounded-full bg-gradient-to-br from-primary/5 to-secondary/5 opacity-50 transition-all duration-300 group-hover:scale-110 group-hover:opacity-70" />
			</CardContent>
		</Card>
	)
}
