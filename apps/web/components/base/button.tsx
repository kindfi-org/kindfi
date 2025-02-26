import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '../../lib/utils'

/**
 * ShadCN/UI Reference:https://ui.shadcn.com/docs/components/button
 * `buttonVariants` defines the styles and variants for the `Button` component.
 * It includes options for different button variants and sizes, along with default configurations.
 *
 * @example
 * // Default variant with large size
 * buttonVariants({ variant: 'default', size: 'lg' })
 *
 * // Destructive variant with icon size
 * buttonVariants({ variant: 'destructive', size: 'icon' })
 */
const buttonVariants = cva(
	'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
	{
		variants: {
			/** Defines different button visual styles */
			variant: {
				default: 'text-blue-700',
				destructive:
					'bg-destructive text-destructive-foreground hover:bg-destructive/90',
				outline:
					'border border-input bg-background text-black hover:text-blue-700',
				secondary:
					'bg-secondary text-secondary-foreground hover:bg-secondary/80',
				ghost: 'hover:gradient-border-btn',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			/** Defines the button's size */
			size: {
				default: 'h-10 px-4 py-2',
				sm: 'h-9 rounded-md px-3',
				lg: 'h-11 rounded-md px-8',
				icon: 'h-10 w-10',
			},
		},
		/** Default variants if no props are provided */
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
)

/**
 * `ButtonProps` is the type definition for the `Button` component's props.
 * It extends `React.ButtonHTMLAttributes<HTMLButtonElement>` and adds additional variant and size options.
 *
 * @interface
 * @property {boolean} [asChild] - If true, the button will render as a child component.
 * @property {string} [className] - Additional class names to apply custom styles to the button.
 * @property {VariantProps<typeof buttonVariants>['variant']} [variant] - Defines the style variant of the button.
 * @property {VariantProps<typeof buttonVariants>['size']} [size] - Defines the size of the button.
 */
export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean
}

/**
 * `Button` component used for triggering actions within the UI. It supports various variants and sizes,
 * and it can optionally render as a child component to integrate with other UI elements.
 *
 * @component
 * @example
 * <Button variant="default" size="lg">Click Me</Button>
 * @example
 * <Button asChild> <Link href="/home">Go to Home</Link> </Button>
 *
 * @param {ButtonProps} props - The props for the `Button` component.
 * @param {React.Ref} ref - The ref to forward to the button element.
 * @returns {JSX.Element} The rendered button element.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : 'button'
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			/>
		)
	},
)

Button.displayName = 'Button'

export { Button, buttonVariants }
