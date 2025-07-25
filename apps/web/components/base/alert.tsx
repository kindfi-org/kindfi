import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '~/lib/utils'

/**
 * ShadCN/UI Reference: https://ui.shadcn.com/docs/components/alert
 * `alertVariants` defines the styles and variants for the `Alert` component.
 * It includes options for different alert styles.
 */
const alertVariants = cva(
	'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
	{
		variants: {
			/** Defines the visual style of the alert */
			variant: {
				default: 'bg-background text-foreground',
				destructive:
					'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
			},
		},
		/** Default variant if no variant is provided */
		defaultVariants: {
			variant: 'default',
		},
	},
)

/**
 * `Alert` component displays a contextual message or notification to the user.
 * It supports different variants (e.g., default, destructive) to indicate the type of alert.
 *
 * @component
 * @example
 * <Alert variant="destructive">This is a destructive alert message.</Alert>
 *
 * @param {React.HTMLAttributes<HTMLDivElement>} props - The props for the `Alert` component.
 * @param {string} [props.variant="default"] - Defines the style of the alert. Options include `default` and `destructive`.
 * @param {string} [props.className] - Additional class names to apply custom styles to the alert.
 * @param {React.Ref} ref - The ref to forward to the alert element.
 * @returns {JSX.Element} The rendered alert component.
 */
const Alert = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
	<div
		ref={ref}
		role="alert"
		className={cn(alertVariants({ variant }), className)}
		{...props}
	/>
))
Alert.displayName = 'Alert'

/**
 * `AlertTitle` component is used to display the title or heading of the alert.
 * It is typically placed at the top of the alert to summarize the message.
 *
 * @component
 * @example
 * <AlertTitle>This is the alert title</AlertTitle>
 *
 * @param {React.HTMLAttributes<HTMLHeadingElement>} props - The props for the `AlertTitle` component.
 * @param {string} [props.className] - Additional class names to style the title.
 * @param {React.Ref} ref - The ref to forward to the alert title element.
 * @returns {JSX.Element} The rendered alert title component.
 */
const AlertTitle = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
	<h5
		ref={ref}
		className={cn('mb-1 font-medium leading-none tracking-tight', className)}
		{...props}
	/>
))
AlertTitle.displayName = 'AlertTitle'

/**
 * `AlertDescription` component is used to display additional details or the description of the alert.
 * It provides context or further explanation of the alert message.
 *
 * @component
 * @example
 * <AlertDescription>This is the detailed description of the alert.</AlertDescription>
 *
 * @param {React.HTMLAttributes<HTMLParagraphElement>} props - The props for the `AlertDescription` component.
 * @param {string} [props.className] - Additional class names to apply custom styles to the description.
 * @param {React.Ref} ref - The ref to forward to the alert description element.
 * @returns {JSX.Element} The rendered alert description component.
 */
const AlertDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn('text-sm [&_p]:leading-relaxed', className)}
		{...props}
	/>
))
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertDescription, AlertTitle }
