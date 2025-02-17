import { type VariantProps, cva } from 'class-variance-authority'
import type * as React from 'react'

import { cn } from '~/lib/utils'
/**
 *  ShadCN/UI Reference:https://ui.shadcn.com/docs/components/badge
 * A Badge component is a small UI element used to display contextual information, often in the form of labels or status indicators.
 * It supports various variants to reflect different states (e.g., primary, secondary, destructive).
 *
 * @component
 * @example
 * <Badge variant="default">New</Badge>
 * <Badge variant="destructive">Deleted</Badge>
 *
 * @param {BadgeProps} props - The props for the `Badge` component.
 * @param {string} [props.className] - Optional class names for custom styling.
 * @param {string} [props.variant="default"] - Defines the style of the badge. Options include:
 *   - `default`: Default style, primary color.
 *   - `secondary`: Secondary style, for less important status.
 *   - `destructive`: Used for destructive or warning status.
 *   - `outline`: A minimal outline style, text only.
 * @returns {JSX.Element} The rendered Badge component.
 */
/**
 * Badge component variants and their respective styles.
 * @typedef {Object} BadgeVariants
 * @property {string} default - Default primary badge style with solid background, used for general status indicators.
 * @property {string} secondary - Secondary badge style with muted colors, suitable for less prominent information.
 * @property {string} destructive - Destructive badge style with warning colors, used for error states or critical alerts.
 * @property {string} outline - Minimal outline style without background, ideal for subtle indicators.
 */
const badgeVariants = cva(
	'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
	{
		variants: {
			variant: {
				default:
					'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
				secondary:
					'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
				destructive:
					'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
				outline: 'text-foreground',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
)

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
	return (
		<div className={cn(badgeVariants({ variant }), className)} {...props} />
	)
}

export { Badge, badgeVariants }
