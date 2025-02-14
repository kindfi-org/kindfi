import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import * as React from 'react'

import { cn } from '~/lib/utils'
import { type ButtonProps, buttonVariants } from './button'

/**
 * Pagination navigation container component.
 * @param {Object} props - React component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} Navigation element for pagination.
 */
const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
	<nav
		aria-label="pagination"
		className={cn('mx-auto flex w-full justify-center', className)}
		{...props}
	/>
)
Pagination.displayName = 'Pagination'

/**
 * Pagination content wrapper.
 * @param {Object} props - React component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {React.Ref<HTMLUListElement>} ref - Forwarded ref.
 * @returns {JSX.Element} Unordered list element.
 */
const PaginationContent = React.forwardRef<
	HTMLUListElement,
	React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
	<ul
		ref={ref}
		className={cn('flex flex-row items-center gap-1', className)}
		{...props}
	/>
))
PaginationContent.displayName = 'PaginationContent'

/**
 * Individual pagination item wrapper.
 * @param {Object} props - React component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {React.Ref<HTMLLIElement>} ref - Forwarded ref.
 * @returns {JSX.Element} List item element.
 */
const PaginationItem = React.forwardRef<
	HTMLLIElement,
	React.ComponentProps<'li'>
>(({ className, ...props }, ref) => (
	<li ref={ref} className={cn('', className)} {...props} />
))
PaginationItem.displayName = 'PaginationItem'

/**
 * Props for PaginationLink component.
 * @typedef {Object} PaginationLinkProps
 * @property {boolean} [isActive] - Whether the link is active.
 * @property {ButtonProps['size']} [size] - Size of the button.
 */
type PaginationLinkProps = {
	isActive?: boolean
} & Pick<ButtonProps, 'size'> &
	React.ComponentProps<'a'>

/**
 * Pagination link component.
 * @param {PaginationLinkProps} props - React component props.
 * @returns {JSX.Element} Anchor element for pagination links.
 */
const PaginationLink = ({
	className,
	isActive,
	size = 'icon',
	...props
}: PaginationLinkProps) => (
	<a
		aria-current={isActive ? 'page' : undefined}
		className={cn(
			buttonVariants({
				variant: isActive ? 'outline' : 'ghost',
				size,
			}),
			className,
		)}
		{...props}
	/>
)
PaginationLink.displayName = 'PaginationLink'

/**
 * Previous page button.
 * @param {React.ComponentProps<typeof PaginationLink>} props - React component props.
 * @returns {JSX.Element} Button to go to the previous page.
 */
const PaginationPrevious = ({
	className,
	...props
}: React.ComponentProps<typeof PaginationLink>) => (
	<PaginationLink
		aria-label="Go to previous page"
		size="default"
		className={cn('gap-1 pl-2.5', className)}
		{...props}
	>
		<ChevronLeft className="h-4 w-4" />
		<span>Previous</span>
	</PaginationLink>
)
PaginationPrevious.displayName = 'PaginationPrevious'

/**
 * Next page button.
 * @param {React.ComponentProps<typeof PaginationLink>} props - React component props.
 * @returns {JSX.Element} Button to go to the next page.
 */
const PaginationNext = ({
	className,
	...props
}: React.ComponentProps<typeof PaginationLink>) => (
	<PaginationLink
		aria-label="Go to next page"
		size="default"
		className={cn('gap-1 pr-2.5', className)}
		{...props}
	>
		<span>Next</span>
		<ChevronRight className="h-4 w-4" />
	</PaginationLink>
)
PaginationNext.displayName = 'PaginationNext'

/**
 * Ellipsis for skipped pagination pages.
 * @param {Object} props - React component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} Span element representing skipped pages.
 */
const PaginationEllipsis = ({
	className,
	...props
}: React.ComponentProps<'span'>) => (
	<span
		aria-hidden
		className={cn('flex h-9 w-9 items-center justify-center', className)}
		{...props}
	>
		<MoreHorizontal className="h-4 w-4" />
		<span className="sr-only">More pages</span>
	</span>
)
PaginationEllipsis.displayName = 'PaginationEllipsis'

export {
	Pagination,
	PaginationContent,
	PaginationLink,
	PaginationItem,
	PaginationPrevious,
	PaginationNext,
	PaginationEllipsis,
}
