import { cn } from '~/lib/utils'

interface SectionContainerProps {
	children: React.ReactNode
	className?: string
	/**
	 * Maximum width constraint
	 * @default '7xl' - Standard max width for most sections
	 */
	maxWidth?: 'full' | '7xl' | '6xl' | '5xl' | '4xl'
	/**
	 * Whether to add horizontal padding
	 * @default true
	 */
	withPadding?: boolean
}

const maxWidthClasses = {
	full: 'max-w-full',
	'9xl': 'max-w-9xl',
	'8xl': 'max-w-8xl',
	'7xl': 'max-w-7xl',
	'6xl': 'max-w-6xl',
	'5xl': 'max-w-5xl',
	'4xl': 'max-w-4xl',
}

/**
 * SectionContainer provides consistent layout constraints for sections
 * - Consistent horizontal padding across breakpoints
 * - Centered content with configurable max-width
 * - Responsive design following mobile-first approach
 */
export function SectionContainer({
	children,
	className,
	maxWidth = '7xl',
	withPadding = true,
}: SectionContainerProps) {
	return (
		<div
			className={cn(
				'mx-auto w-full',
				maxWidthClasses[maxWidth],
				withPadding && 'px-4 sm:px-6 lg:px-8',
				className,
			)}
		>
			{children}
		</div>
	)
}
