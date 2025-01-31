import * as React from 'react'

import { cn } from '~/lib/utils'

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {}
/**
 * ShadCN/UI Reference:https://ui.shadcn.com/docs/components/input
 * Input component for rendering styled input fields with support for various HTML input attributes.
 * This component provides a flexible and customizable input element, including styles for focus, disabled state, and file inputs.
 *
 * @component
 *
 * @example
 * <Input type="text" placeholder="Enter your name" />
 *
 * @param {InputProps} props - The component props.
 * @param {string} [props.className] - Additional CSS classes for custom styling.
 * @param {string} [props.type] - Specifies the type of the input (e.g., "text", "password", "file").
 *
 * @returns {JSX.Element} The Input component.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, ...props }, ref) => {
		return (
			<input
				type={type}
				className={cn(
					'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
					className,
				)}
				ref={ref}
				{...props}
			/>
		)
	},
)
Input.displayName = 'Input'

export { Input }
