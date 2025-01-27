import { cn } from '~/lib/utils'

/**
 * Skeleton loader component used for displaying a loading placeholder.
 * It renders a pulsing animation to indicate that content is loading.
 * The component is ARIA-friendly and indicates its loading state to screen readers.
 *
 * @component
 *
 * @example
 * // Basic usage
 * <Skeleton className="h-12 w-full" />
 * 
 * // Common use cases
 * <div role="status" aria-label="Loading content">
 *   <Skeleton className="h-8 w-32 mb-4" /> {/* Title */}
 *   <Skeleton className="h-4 w-full mb-2" /> {/* Text line */}
 *   <Skeleton className="h-4 w-2/3" />      {/* Text line */}
 * </div>
 *
 * @param {React.HTMLAttributes<HTMLDivElement>} props - The component props
 * @param {string} [props.className] - Custom CSS classes to apply to the skeleton loader.
 *
 * @returns {JSX.Element} The Skeleton component.
 */
function Skeleton({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn('animate-pulse rounded-md bg-primary/10', className)}
			{...props}
		/>
	)
}

export { Skeleton }
