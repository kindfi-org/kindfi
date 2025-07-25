'use client'

import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import * as React from 'react'

import { cn } from '~/lib/utils'

/**
 *  ShadCN/UI Reference:https://ui.shadcn.com/docs/components/checkbox
 * Checkbox component that wraps Radix UI's `Checkbox` and provides custom styling.
 * This component is fully accessible, supporting keyboard navigation and screen readers.
 *
 * @param {React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>} props - The properties for the checkbox component.
 * @param {React.Ref} ref - The reference to the root checkbox element.
 * @param {string} [props.className] - Additional CSS classes for styling
 *
 * @example
 * // Basic usage
 * <Checkbox id="terms" />
 *
 * // With label and form integration
 * <form onSubmit={handleSubmit}>
 *   <div className="flex items-center space-x-2">
 *     <Checkbox id="terms" name="terms" required />
 *     <label
 *       htmlFor="terms"
 *       className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
 *     >
 *       Accept terms and conditions
 *     </label>
 *   </div>
 * </form>
 *
 * @returns {JSX.Element} The rendered checkbox component.
 */
const Checkbox = React.forwardRef<
	React.ElementRef<typeof CheckboxPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
	<CheckboxPrimitive.Root
		ref={ref}
		className={cn(
			'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
			className,
		)}
		{...props}
	>
		<CheckboxPrimitive.Indicator
			className={cn('flex items-center justify-center text-current')}
		>
			<Check className="h-4 w-4" />
		</CheckboxPrimitive.Indicator>
	</CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
