interface HeroBadgeProps {
	text: string
}

export function HeroBadge({ text }: HeroBadgeProps) {
	return (
		<div className="inline-flex items-center rounded-full border border-gray-200 bg-white/50 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
			{text}
		</div>
	)
}
