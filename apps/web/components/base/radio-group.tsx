'use client'

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { Circle } from 'lucide-react'
import * as React from 'react'

import { cn } from '~/lib/utils'
/**
 *  ShadCN/UI Reference:https://ui.shadcn.com/docs/components/radio-group
 * RadioGroup component for selecting a single option from a group.
 * Built on top of Radix UI RadioGroup primitive for reliable accessibility.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} [props.className] - Additional class names for styling.
 * @param {string} [props.value] - The controlled value of the radio group
 * @param {(value: string) => void} [props.onValueChange] - Event handler called when the value changes
 * @param {boolean} [props.disabled] - When true, prevents user interaction with the radio group
 * @param {string} [props.orientation] - The orientation of the radio group ('horizontal' | 'vertical')
 * @param {React.Ref} ref - Reference to the radio group root element.
 * @aria Implements proper ARIA attributes and keyboard navigation
 * @see {@link https://www.radix-ui.com/primitives/docs/components/radio-group Radix UI Radio Group}
 *
 * @example
 * <RadioGroup
 *   value={selectedFruit}
 *   onValueChange={setSelectedFruit}
 *   className="space-y-2"
 * >
 *   <RadioGroupItem value="apple" id="apple">Apple</RadioGroupItem>
 *   <RadioGroupItem value="orange" id="orange">Orange</RadioGroupItem>
 * </RadioGroup>
 *
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
 * Built on top of Radix UI RadioGroup.Item primitive for reliable accessibility.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} [props.className] - Additional class names for styling.
 * @param {string} props.value - The unique value of the radio item
 * @param {boolean} [props.disabled] - When true, prevents user interaction
 * @param {string} [props.id] - The id of the radio item
 * @param {React.Ref} ref - Reference to the radio group item element.
 * @aria Implements proper ARIA attributes and keyboard interaction
 *
 * @example
 * <RadioGroupItem
 *   value="option1"
 *   id="option1"
 *   disabled={isDisabled}
 *   className="custom-radio"
 * />
 *
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
