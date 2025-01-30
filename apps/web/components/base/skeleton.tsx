import { cn } from '~/lib/utils'

/**
 *  ShadCN/UI Reference:https://ui.shadcn.com/docs/components/skeleton
 * Skeleton loader component used as a placeholder for loading content.
 * It renders a pulsing animation to indicate a loading state.
 *
 * This component does not include `role="status"` or `aria-live="polite"` by default,
 * but users can add these attributes if needed for better accessibility.
 *
 * @component
 *
 * @example
 * // Basic usage
 * <Skeleton className="h-12 w-full" />
 *
 * // Usage with accessibility considerations
 * <div role="status" aria-label="Loading content">
 *   <Skeleton className="h-8 w-32 mb-4" />
 *   <Skeleton className="h-4 w-full mb-2" />
 *   <Skeleton className="h-4 w-2/3" />
 * </div>
 *
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Props for the Skeleton component.
 * @param {string} [props.className] - Additional CSS classes for customization.
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
