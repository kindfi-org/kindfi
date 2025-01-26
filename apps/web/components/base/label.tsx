'use client'

import * as LabelPrimitive from '@radix-ui/react-label'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '~/lib/utils'

/**
 * Label component used for associating a label with a form control (e.g., input, textarea).
 * It uses Radix UI's Label component for accessibility and styling, with support for additional variant-based customization.
 *
 * @component
 *
 * @example
 * <Label htmlFor="email" className="text-primary">Email</Label>
 *
 * @param {React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>} props - The component props.
 * @param {string} [props.className] - Custom CSS classes to apply to the label.
 *
 * @returns {JSX.Element} The Label component.
 */
const labelVariants = cva(
	'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
)

const Label = React.forwardRef<
	React.ElementRef<typeof LabelPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
		VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
	<LabelPrimitive.Root
		ref={ref}
		className={cn(labelVariants(), className)}
		{...props}
	/>
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
