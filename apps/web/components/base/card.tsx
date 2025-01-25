import * as React from 'react'

import { cn } from '~/lib/utils'

/**
 * The Card component is a container that provides a flexible and consistent layout for grouping content in a styled box with shadow and rounded corners.
 * It contains different sections (header, content, footer) that can be customized using the various sub-components.
 *
 * @component
 * @example
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Card Title</CardTitle>
 *     <CardDescription>Card Description</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     Main content of the card.
 *   </CardContent>
 *   <CardFooter>Footer content</CardFooter>
 * </Card>
 *
 * @param {React.HTMLAttributes<HTMLDivElement>} props - The props for the `Card` component.
 * @param {string} [props.className] - Optional class names for custom styling.
 * @returns {JSX.Element} The rendered Card component.
 */
const Card = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			'rounded-lg border bg-card text-card-foreground shadow-sm',
			className,
		)}
		{...props}
	/>
))
Card.displayName = 'Card'

/**
 * CardHeader is the section at the top of the card, often used for titles, descriptions, or any introductory content.
 * It can be customized with additional styling.
 *
 * @param {React.HTMLAttributes<HTMLDivElement>} props - The props for the `CardHeader` component.
 * @param {string} [props.className] - Optional class names for custom styling.
 * @returns {JSX.Element} The rendered CardHeader component.
 */
const CardHeader = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn('flex flex-col space-y-1.5 p-6', className)}
		{...props}
	/>
))
CardHeader.displayName = 'CardHeader'

/**
 * CardTitle is the main title of the card, usually in a larger font, typically positioned inside the CardHeader.
 *
 * @param {React.HTMLAttributes<HTMLHeadingElement>} props - The props for the `CardTitle` component.
 * @param {string} [props.className] - Optional class names for custom styling.
 * @returns {JSX.Element} The rendered CardTitle component.
 */
const CardTitle = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
	<h3
		ref={ref}
		className={cn(
			'text-2xl font-semibold leading-none tracking-tight',
			className,
		)}
		{...props}
	/>
))
CardTitle.displayName = 'CardTitle'

/**
 * CardDescription provides additional information or context about the content of the card.
 * It's usually placed below the CardTitle inside the CardHeader.
 *
 * @param {React.HTMLAttributes<HTMLParagraphElement>} props - The props for the `CardDescription` component.
 * @param {string} [props.className] - Optional class names for custom styling.
 * @returns {JSX.Element} The rendered CardDescription component.
 */
const CardDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<p
		ref={ref}
		className={cn('text-sm text-muted-foreground', className)}
		{...props}
	/>
))
CardDescription.displayName = 'CardDescription'

/**
 * CardContent is the main section of the card, typically where the primary content (text, images, etc.) resides.
 * It provides padding and spacing for the content inside the card.
 *
 * @param {React.HTMLAttributes<HTMLDivElement>} props - The props for the `CardContent` component.
 * @param {string} [props.className] - Optional class names for custom styling.
 * @returns {JSX.Element} The rendered CardContent component.
 */
const CardContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

/**
 * CardFooter is the bottom section of the card, typically used for actions, links, or other content related to the card.
 *
 * @param {React.HTMLAttributes<HTMLDivElement>} props - The props for the `CardFooter` component.
 * @param {string} [props.className] - Optional class names for custom styling.
 * @returns {JSX.Element} The rendered CardFooter component.
 */
const CardFooter = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn('flex items-center p-6 pt-0', className)}
		{...props}
	/>
))
CardFooter.displayName = 'CardFooter'

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
