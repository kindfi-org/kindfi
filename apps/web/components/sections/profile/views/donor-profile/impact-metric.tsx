interface ImpactMetricProps {
	label: string
	value: string
	description: string
}

export function ImpactMetric({ label, value, description }: ImpactMetricProps) {
	return (
		<div className="space-y-1">
			<p className="text-sm font-medium text-muted-foreground">{label}</p>
			<p className="text-2xl font-bold text-foreground">{value}</p>
			<p className="text-xs text-muted-foreground">{description}</p>
		</div>
	)
}
