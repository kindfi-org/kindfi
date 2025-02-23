interface ExampleHighlightProps {
	icon: React.ReactNode
	title: string
	description: string
}

export function ExampleHighlightCard({
	icon,
	title,
	description,
}: ExampleHighlightProps) {
	return (
		<div className="flex gap-3">
			<div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 border border-none">
				{icon}
			</div>
			<div>
				<h4 className="font-medium text-gray-900">{title}</h4>
				<p className="text-gray-600">{description}</p>
			</div>
		</div>
	)
}
