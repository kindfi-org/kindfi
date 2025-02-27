import type { ReactNode } from 'react'

interface PageSectionProps {
	children: ReactNode
	className?: string
	background?: 'white' | 'light' | 'gradient'
	containerWidth?: string
}

export const PageSection: React.FC<PageSectionProps> = ({
	children,
	className = '',
	background = 'white',
	containerWidth = 'container',
}) => {
	const bgClasses = {
		white: 'bg-white',
		light: 'bg-[#FAFAFA]',
		gradient: 'bg-gradient-to-br from-primary-50/50 to-transparent',
	}

	return (
		<section
			className={`py-24 lg:py-32 px-6 lg:px-8 ${bgClasses[background]} ${className}`}
		>
			<div className={containerWidth}>{children}</div>
		</section>
	)
}
