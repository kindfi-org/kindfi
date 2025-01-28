'use client'

import * as ProgressPrimitive from '@radix-ui/react-progress'
import * as React from 'react'

import { cn } from '~/lib/utils'
/**
 *  ShadCN/UI Reference:https://ui.shadcn.com/docs/components/progress
 * Progress component for displaying loading or completion status.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} [props.className] - Additional class names for styling.
 * @param {number} [props.value] - The current progress value (0-100).
 * @param {React.Ref} ref - Reference to the progress root element.
 * @returns {JSX.Element} The rendered Progress component.
 */
const Progress = React.forwardRef<
	React.ElementRef<typeof ProgressPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
	<ProgressPrimitive.Root
		ref={ref}
		className={cn(
			'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
			className,
		)}
		{...props}
	>
		<ProgressPrimitive.Indicator
			className="h-full w-full flex-1 gradient-progress transition-all"
			style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
		/>
	</ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
