interface SectionHeaderProps {
	title: string
	description: string
	alignment?: 'left' | 'center'
	className?: string
}

export function SectionHeader({
	title,
	description,
	alignment = 'center',
	className = '',
}: SectionHeaderProps) {
	const alignmentClasses =
		alignment === 'center' ? 'text-center mx-auto' : 'text-left'

	return (
		<div className={`max-w-2xl ${alignmentClasses} mb-16 ${className}`}>
			<h2 className="h2 mb-4">{title}</h2>
			<p className="body-large text-muted-foreground">{description}</p>
		</div>
	)
}
