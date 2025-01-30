'use client'

import * as SwitchPrimitives from '@radix-ui/react-switch'
import * as React from 'react'

import { cn } from '~/lib/utils'

/**
 *  ShadCN/UI Reference:https://ui.shadcn.com/docs/components/switch
 * Switch component for creating toggle switches with customizable styles and state.
 * Built on top of Radix UI Switch primitive for reliable accessibility.
 * @component
 * @param {React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>} props - The component props
 * @param {string} [props.className] - Additional custom CSS classes for styling the switch
 * @param {boolean} [props.checked] - The controlled checked state of the switch
 * @param {(checked: boolean) => void} [props.onCheckedChange] - Event handler called when the checked state changes
 * @param {boolean} [props.disabled] - When true, prevents the user from interacting with the switch
 * @param {string} [props.id] - The id of the switch
 * @aria Implements proper ARIA attributes and keyboard interactions
 * @see {@link https://www.radix-ui.com/primitives/docs/components/switch Radix UI Switch}
 * @example
 * <Switch
 *   checked={isEnabled}
 *   onCheckedChange={setIsEnabled}
 *   disabled={isLoading}
 *   id="notifications"
 *   aria-label="Enable notifications"
 * />
 * @returns {JSX.Element} The rendered Switch component
 */
const Switch = React.forwardRef<
	React.ElementRef<typeof SwitchPrimitives.Root>,
	React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
	<SwitchPrimitives.Root
		className={cn(
			'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
			className,
		)}
		{...props}
		ref={ref}
	>
		<SwitchPrimitives.Thumb
			className={cn(
				'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0',
			)}
		/>
	</SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
