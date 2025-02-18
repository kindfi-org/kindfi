'use client'

import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'
import * as React from 'react'
import { cn } from '~/lib/utils'

/**
 * A scrollable area component using Radix UI's ScrollArea.
 * It provides a viewport with a custom scrollbar.
 *
 * @component
 * @example
 * ```tsx
 * <ScrollArea className="h-64 w-48">
 *   <div className="p-4">Content goes here...</div>
 * </ScrollArea>
 * ```
 */
const ScrollArea = React.forwardRef<
	React.ElementRef<typeof ScrollAreaPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
	<ScrollAreaPrimitive.Root
		ref={ref}
		className={cn('relative overflow-hidden', className)}
		{...props}
	>
		<ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
			{children}
		</ScrollAreaPrimitive.Viewport>
		<ScrollBar />
		<ScrollAreaPrimitive.Corner />
	</ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

/**
 * Custom scrollbar for the ScrollArea component.
 * Supports both vertical and horizontal orientations.
 *
 * @component
 * @example
 * ```tsx
 * <ScrollBar orientation="horizontal" />
 * ```
 *
 * @param {Object} props - The component props.
 * @param {string} [props.orientation="vertical"] - The scrollbar orientation.
 */
const ScrollBar = React.forwardRef<
	React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
	React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = 'vertical', ...props }, ref) => (
	<ScrollAreaPrimitive.ScrollAreaScrollbar
		ref={ref}
		orientation={orientation}
		className={cn(
			'flex touch-none select-none transition-colors',
			orientation === 'vertical' &&
				'h-full w-2.5 border-l border-l-transparent p-[1px]',
			orientation === 'horizontal' &&
				'h-2.5 border-t border-t-transparent p-[1px]',
			className,
		)}
		{...props}
	>
		<ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
	</ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
