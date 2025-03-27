import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '~/lib/utils'

/**
 * ShadCN/UI Reference: https://ui.shadcn.com/docs/components/button
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
 * @property {boolean} [isLink] - If true, the button will have role="link" attribute.
 * @property {React.ReactNode} [startIcon] - Icon to be displayed before the button text.
 * @property {React.ReactNode} [endIcon] - Icon to be displayed after the button text.
 * @property {boolean} [iconOnly] - Indicates if the button only contains an icon.
 */
export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean
	isLink?: boolean
	startIcon?: React.ReactNode
	endIcon?: React.ReactNode
	iconOnly?: boolean
	'aria-label'?: boolean extends true ? string : string | undefined
}

/**
 * `Button` component used for triggering actions within the UI. It supports various variants and sizes,
 * and it can optionally render as a child component to integrate with other UI elements.
 * This component handles proper ARIA attributes and enforces accessibility best practices.
 *
 * @component
 * @example
 * // Standard button
 * <Button variant="default" size="lg">Click Me</Button>
 *
 * @example
 * // Button as a link
 * <Button isLink asChild><Link href="/home">Go to Home</Link></Button>
 *
 * @example
 * // Icon-only button
 * <Button iconOnly aria-label="Close dialog" size="icon"><XIcon /></Button>
 *
 * @example
 * // Button with start icon
 * <Button startIcon={<UserIcon />}>User Profile</Button>
 *
 * @param {ButtonProps} props - The props for the `Button` component.
 * @param {React.Ref} ref - The ref to forward to the button element.
 * @returns {JSX.Element} The rendered button element.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className,
			variant,
			size,
			asChild = false,
			isLink = false,
			children,
			startIcon,
			endIcon,
			iconOnly = false,
			'aria-label': ariaLabel,
			...props
		},
		ref,
	) => {
		const Comp = asChild ? Slot : 'button'

		// Determine if button content is empty or only contains icons
		const hasTextContent = React.Children.toArray(children).some(
			(child) => typeof child === 'string' || typeof child === 'number',
		)

		// Use the iconOnly prop or determine it based on the presence of text content
		const isIconOnly =
			iconOnly || (!hasTextContent && (startIcon || endIcon || children))

		// Warning for icon-only buttons without aria-label in development
		if (process.env.NODE_ENV !== 'production' && isIconOnly && !ariaLabel) {
			;+console.error(
				`Accessibility error: Icon-only Button must have an aria-label to describe its purpose. Component: ${Button.displayName}`,
			)
		}

		// Generate props based on component state
		const buttonProps: React.ButtonHTMLAttributes<HTMLButtonElement> & {
			role?: string
		} = {
			role: isLink ? 'link' : undefined,
			'aria-label': ariaLabel || (isIconOnly ? String(children) : 'Button'),
			title: ariaLabel || (typeof children === 'string' ? children : 'Button'),
			...(process.env.NODE_ENV !== 'production' &&
				isLink &&
				!('href' in props) && {
					onClick: (e) => {
						console.warn(
							'Accessibility warning: Buttons with role="link" should have an href attribute.',
						)
						props.onClick?.(e)
					},
				}),
			...props,
		}

		return asChild ? (
			<Slot
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
			>
				{React.cloneElement(children as React.ReactElement, buttonProps)}
			</Slot>
		) : (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...buttonProps}
			>
				{startIcon}
				{children}
				{endIcon}
			</Comp>
		)
	},
)

Button.displayName = 'Button'

export { Button, buttonVariants }

/**
 * Button Component Usage Examples
 *
 * 1. Standard Button
 * ```tsx
 * <Button>Click Me</Button>
 * ```
 *
 * 2. Button with variant and size
 * ```tsx
 * <Button variant="destructive" size="lg">Delete Item</Button>
 * ```
 *
 * 3. Button as a link (preserves ARIA attributes)
 * ```tsx
 * <Button isLink asChild>
 *   <Link href="/dashboard">Go to Dashboard</Link>
 * </Button>
 * ```
 *
 * 4. Icon-only button (requires aria-label)
 * ```tsx
 * <Button
 *   iconOnly
 *   size="icon"
 *   aria-label="Close dialog"
 *   onClick={closeDialog}
 * >
 *   <XIcon />
 * </Button>
 * ```
 *
 * 5. Button with icon and text
 * ```tsx
 * <Button startIcon={<UserIcon />}>Profile</Button>
 * <Button endIcon={<ArrowRightIcon />}>Next</Button>
 * ```
 *
 * 6. Disabled button
 * ```tsx
 * <Button disabled>Not Available</Button>
 * ```
 *
 * 7. Button with ARIA attributes
 * ```tsx
 * <Button
 *   aria-haspopup="true"
 *   aria-expanded={menuOpen}
 *   aria-controls="menu-dropdown"
 * >
 *   Open Menu
 * </Button>
 * ```
 * 
 * // Example of button with dynamic ARIA attributes
*	const [isOpen, setIsOpen] = useState(false);

	<Button 
		aria-haspopup="true"
		aria-expanded={isOpen}
		aria-controls="dropdown-menu"
		onClick={() => setIsOpen(!isOpen)}
		endIcon={<ChevronDownIcon />}
	>
		Toggle Menu
	</Button>
 */
