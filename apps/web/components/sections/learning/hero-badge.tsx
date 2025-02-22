interface HeroBadgeProps {
	text: string
}

export function HeroBadge({ text }: HeroBadgeProps) {
	return (
		<div className="inline-flex items-center rounded-full border bg-white/50 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-primary mb-8">
			{text}
		</div>
	)
}
