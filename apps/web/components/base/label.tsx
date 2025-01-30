'use client'

import * as LabelPrimitive from '@radix-ui/react-label'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '~/lib/utils'

/**
 *  ShadCN/UI Reference:https://ui.shadcn.com/docs/components/label
 * Label component used for associating a label with a form control (e.g., input, textarea).
 * It uses Radix UI's Label component for accessibility and styling, with support for additional variant-based customization.
 *
 * @component
 * @see {@link https://www.radix-ui.com/primitives/docs/components/label Radix UI Label Primitive}
 *
 * @example
 * // Basic usage
 * <Label htmlFor="email">Email</Label>
 *
 * // With custom styling
 * <Label htmlFor="email" className="text-primary">Email</Label>
 *
 * // With form control
 * <div>
 *   <Label htmlFor="email">Email</Label>
 *   <Input id="email" type="email" />
 * </div>
 *
 * @accessibility
 * - Automatically associates with form controls using htmlFor
 * - Supports keyboard navigation and screen readers
 *
 * @param {React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>} props - The component props.
 * @param {string} [props.className] - Custom CSS classes to apply to the label.
 * @param {VariantProps<typeof labelVariants>} props.variants - Style variants from class-variance-authority.
 *
 * @returns {JSX.Element} The Label component.
 *
 * @remarks
 * This component uses React.forwardRef to allow ref forwarding to the underlying Radix UI Label component.
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
