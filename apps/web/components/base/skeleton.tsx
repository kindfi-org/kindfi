import { cn } from '~/lib/utils'

/**
 * Skeleton loader component used for displaying a loading placeholder.
 * It renders a pulsing animation to indicate that content is loading.
 *
 * @component
 *
 * @example
 * <Skeleton className="h-12 w-full" />
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
