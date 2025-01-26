'use client'

import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import * as React from 'react'

import { cn } from '~/lib/utils'

/**
 * Tooltip component using Radix UI for providing hover-based tooltips.
 * Can be used to display informative messages when users hover over elements.
 *
 * @component
 *
 * @example
 * <Tooltip>
 *   <TooltipTrigger>Hover over me</TooltipTrigger>
 *   <TooltipContent>Here is the tooltip content</TooltipContent>
 * </Tooltip>
 */

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger
/**
 * TooltipContent component that renders the tooltip message.
 *
 * @component
 * @param {React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>} props - The component props
 * @param {number} [props.sideOffset=4] - The distance between the tooltip and the target element.
 * @param {string} [props.className] - Additional CSS classes to apply to the tooltip.
 *
 * @example
 * <TooltipContent sideOffset={10}>This is a tooltip message</TooltipContent>
 */
const TooltipContent = React.forwardRef<
	React.ElementRef<typeof TooltipPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
	<TooltipPrimitive.Portal>
		<TooltipPrimitive.Content
			ref={ref}
			sideOffset={sideOffset}
			className={cn(
				'z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
				className,
			)}
			{...props}
		/>
	</TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
