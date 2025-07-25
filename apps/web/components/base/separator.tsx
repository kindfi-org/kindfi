'use client'

import * as SeparatorPrimitive from '@radix-ui/react-separator'
import * as React from 'react'

import { cn } from '~/lib/utils'

/**
 *  ShadCN/UI Reference:https://ui.shadcn.com/docs/components/separator
 * Separator component for visually dividing content.
 * Built on top of Radix UI Separator primitive for reliable accessibility.
 *
 * @component
 * @param {object} props - The component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {'horizontal' | 'vertical'} [props.orientation='horizontal'] - Defines the orientation of the separator.
 * @param {boolean} [props.decorative=true] - Whether the separator is purely decorative.
 * @aria Implements proper ARIA attributes for accessibility.
 * @see {@link https://www.radix-ui.com/primitives/docs/components/separator Radix UI Separator}
 *
 * @example
 * // Horizontal separator
 * <Separator className="my-4" />
 *
 * @example
 * // Vertical separator
 * <Separator orientation="vertical" className="mx-2 h-6" />
 *
 * @returns {JSX.Element} The rendered Separator component
 */
const Separator = React.forwardRef<
	React.ElementRef<typeof SeparatorPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
	(
		{ className, orientation = 'horizontal', decorative = true, ...props },
		ref,
	) => (
		<SeparatorPrimitive.Root
			ref={ref}
			decorative={decorative}
			orientation={orientation}
			className={cn(
				'shrink-0 bg-border',
				orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
				className,
			)}
			{...props}
		/>
	),
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
