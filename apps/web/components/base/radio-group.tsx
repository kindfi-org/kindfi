'use client'

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { Circle } from 'lucide-react'
import * as React from 'react'

import { cn } from '~/lib/utils'
/**
 * RadioGroup component for selecting a single option from a group.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} [props.className] - Additional class names for styling.
 * @param {React.Ref} ref - Reference to the radio group root element.
 * @returns {JSX.Element} The rendered RadioGroup component.
 */

const RadioGroup = React.forwardRef<
	React.ElementRef<typeof RadioGroupPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
	return (
		<RadioGroupPrimitive.Root
			className={cn('grid gap-2', className)}
			{...props}
			ref={ref}
		/>
	)
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName
/**
 * RadioGroupItem component representing an individual radio button.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} [props.className] - Additional class names for styling.
 * @param {React.Ref} ref - Reference to the radio group item element.
 * @returns {JSX.Element} The rendered RadioGroupItem component.
 */
const RadioGroupItem = React.forwardRef<
	React.ElementRef<typeof RadioGroupPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
	return (
		<RadioGroupPrimitive.Item
			ref={ref}
			className={cn(
				'aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
				className,
			)}
			{...props}
		>
			<RadioGroupPrimitive.Indicator className="flex items-center justify-center">
				<Circle className="h-3.5 w-3.5 fill-primary" />
			</RadioGroupPrimitive.Indicator>
		</RadioGroupPrimitive.Item>
	)
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
