interface SectionProps {
	children: React.ReactNode
	className?: string
	containerType?: 'full' | 'contained'
}

export const Section = ({
	children,
	className = '',
	containerType = 'contained',
}: SectionProps) => {
	return (
		<section className={`w-full py-12 md:py-16 lg:py-20 ${className}`}>
			<div
				className={containerType === 'full' ? 'w-full' : 'container mx-auto'}
			>
				{children}
			</div>
		</section>
	)
}
