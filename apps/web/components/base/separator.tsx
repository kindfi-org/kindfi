'use client'

import * as SeparatorPrimitive from '@radix-ui/react-separator'
import * as React from 'react'

import { cn } from '~/lib/utils'
/**
 * Separator component for visually dividing content.
 *
 * @component
 * @param {object} props - The component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {'horizontal' | 'vertical'} [props.orientation='horizontal'] - Defines the orientation of the separator.
 * @param {boolean} [props.decorative=true] - Whether the separator is purely decorative.
 *
 * @example
 * // Horizontal separator
 * <Separator />
 *
 * @example
 * // Vertical separator
 * <Separator orientation="vertical" />
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
