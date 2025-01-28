'use client'

import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import * as React from 'react'

import { cn } from '~/lib/utils'

/**
 *  ShadCN/UI Reference:https://ui.shadcn.com/docs/components/tooltip
 * Tooltip component using Radix UI for providing hover-based tooltips.
 * Can be used to display informative messages when users hover over elements.
 *
 * @component
 * @see {@link https://www.radix-ui.com/primitives/docs/components/tooltip Radix UI Tooltip}
 *
 * @remarks
 * Must be wrapped in a TooltipProvider component for proper context management.
 * Follows WAI-ARIA tooltip pattern for accessibility.
 *
 * @example
 * // Basic usage with provider
 * <Tooltip>
 *   <TooltipTrigger>Hover over me</TooltipTrigger>
 *   <TooltipContent>Here is the tooltip content</TooltipContent>
 * </Tooltip>
 *
 * // Complete example with provider
 * <TooltipProvider>
 *   <Tooltip>
 *     <TooltipTrigger asChild>
 *       <button>Hover me</button>
 *     </TooltipTrigger>
 *     <TooltipContent>
 *       Tooltip message
 *     </TooltipContent>
 *   </Tooltip>
 * </TooltipProvider>
 */
/**
 * Provider component for Tooltip context.
 * Must wrap any usage of Tooltip components.
 *
 * @component
 */
const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

/**
 * Trigger element that activates the tooltip on hover.
 *
 * @component
 * @param {React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>} props
 * @param {boolean} [props.asChild] - When true, the trigger will be rendered as its child element
 *
 * @example
 * <TooltipTrigger>Hover me</TooltipTrigger>
 *
 * // Using asChild prop
 * <TooltipTrigger asChild>
 *   <button>Custom trigger</button>
 * </TooltipTrigger>
 */
const TooltipTrigger = TooltipPrimitive.Trigger
/**
 * TooltipContent component that renders the tooltip message.
 *
 * @component
 * @param {React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>} props - The component props
 * @param {number} [props.sideOffset=4] - The distance between the tooltip and the target element.
 * @param {string} [props.className] - Additional CSS classes to apply to the tooltip. Merged with default styles.
 * @param {React.ReactNode} props.children - The content to display in the tooltip.
 *
 * @remarks
 * - Uses React Portal for rendering outside the DOM hierarchy
 * - Includes built-in animations for enter/exit transitions
 * - Supports positioning on all sides (top, right, bottom, left)
 *
 * @example
 * <TooltipContent sideOffset={10}>This is a tooltip message</TooltipContent>
 *
 * // With custom className
 * <TooltipContent className="custom-tooltip">
 *   Custom styled tooltip
 * </TooltipContent>
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
