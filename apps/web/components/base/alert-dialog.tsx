'use client'

import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import * as React from 'react'

import { buttonVariants } from '~/components/base/button'
import useReducedMotion from '~/hooks/use-reduced-motion'
import { animations } from '~/lib/animation'
import { cn } from '~/lib/utils'

const AlertDialog = AlertDialogPrimitive.Root

/**
 *  ShadCN/UI Reference:https://ui.shadcn.com/docs/components/alert-dialog
 * A button that triggers the opening of an alert dialog.
 *
 * @component
 * @example
 * <AlertDialogTrigger>Open Alert</AlertDialogTrigger>
 *
 * @param {Object} props - The component's props.
 * @param {React.ReactNode} props.children - The content that triggers the alert dialog.
 *
 * @returns {JSX.Element} The AlertDialogTrigger component.
 */
const AlertDialogTrigger = AlertDialogPrimitive.Trigger

const AlertDialogPortal = AlertDialogPrimitive.Portal

/**
 * The overlay for the alert dialog that appears over the content.
 * Provides a semi-transparent backdrop that helps maintain focus
 * on the dialog by visually dimming the rest of the page.
 *
 * @component
 *
 * @accessibility
 * - Helps maintain focus within the dialog
 * - Provides visual separation from background content
 * - Animated entrance/exit for better user experience
 *
 * @param {Object} props - The component's props.
 * @param {string} [props.className] - Optional additional CSS classes to apply.
 *
 * @returns {JSX.Element} The rendered overlay element.
 */
const AlertDialogOverlay = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => {
	const reducedMotion = useReducedMotion()
	return (
		<AlertDialogPrimitive.Overlay
			className={cn(
				'fixed inset-0 z-50',
				reducedMotion
					? 'bg-black/80'
					: animations.fadeAndAnimateAndOverlay.inOut,
				className,
			)}
			{...props}
			ref={ref}
		/>
	)
})
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

/**
 * The content section of the alert dialog.
 * This typically contains the message or other elements inside the dialog.
 * When opened, focus is automatically trapped within the dialog content
 * and returned to the trigger when closed.
 *
 * @component
 * @example
 * <AlertDialog>
 *   <AlertDialogTrigger>Open</AlertDialogTrigger>
 *   <AlertDialogContent>
 *     <AlertDialogHeader>
 *       <AlertDialogTitle>Are you sure?</AlertDialogTitle>
 *       <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
 *     </AlertDialogHeader>
 *     <AlertDialogFooter>
 *       <AlertDialogCancel>Cancel</AlertDialogCancel>
 *       <AlertDialogAction>Continue</AlertDialogAction>
 *     </AlertDialogFooter>
 *   </AlertDialogContent>
 * </AlertDialog>
 *
 * @param {Object} props - The component's props.
 * @param {string} [props.className] - Optional additional CSS classes to apply.
 * @param {React.ReactNode} props.children - The dialog content
 *
 * @accessibility
 * - Manages focus trap when dialog is open
 * - Supports keyboard navigation
 * - Implements ARIA dialog pattern
 *
 * @keyboard
 * - Escape: Closes the dialog
 * - Tab: Cycles through focusable elements
 * - Shift+Tab: Cycles backwards through focusable elements
 *
 * @returns {JSX.Element} The rendered content of the alert dialog.
 */
const AlertDialogContent = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => {
	const reducedMotion = useReducedMotion()

	return (
		<AlertDialogPortal>
			<AlertDialogOverlay />
			<AlertDialogPrimitive.Content
				ref={ref}
				aria-live="assertive"
				aria-atomic="true"
				role="alertdialog"
				aria-modal="true"
				aria-describedby={props['aria-describedby'] || 'alert-dialog-desc'}
				className={cn(
					'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-default',
					reducedMotion ? '' : animations.fadeAndZoomAndAnimate.inOut,
					animations.contentSlide.inOut,
					'sm:rounded-lg',
					className,
				)}
				{...props}
			/>
		</AlertDialogPortal>
	)
})
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

/**
 * Header section of the alert dialog, typically used to display a title or heading.
 * Should be used within AlertDialogContent to maintain proper structure.
 *
 * @component
 * @example
 * <AlertDialogHeader>
 *   <AlertDialogTitle>Confirm Action</AlertDialogTitle>
 *   <AlertDialogDescription>
 *     Are you sure you want to continue?
 *   </AlertDialogDescription>
 * </AlertDialogHeader>
 *
 * @param {Object} props - The component's props.
 * @param {string} [props.className] - Optional additional CSS classes to apply.
 * @param {React.ReactNode} props.children - The header content, typically AlertDialogTitle and AlertDialogDescription
 *
 * @returns {JSX.Element} The rendered header element of the dialog.
 */
const AlertDialogHeader = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			'flex flex-col space-y-2 text-center sm:text-left',
			className,
		)}
		{...props}
	/>
)
AlertDialogHeader.displayName = 'AlertDialogHeader'

/**
 * Footer section of the alert dialog, typically used to display action buttons.
 *
 * @component
 *
 * @param {Object} props - The component's props.
 * @param {string} [props.className] - Optional additional CSS classes to apply.
 *
 * @returns {JSX.Element} The rendered footer element of the dialog.
 */
const AlertDialogFooter = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
			className,
		)}
		{...props}
	/>
)
AlertDialogFooter.displayName = 'AlertDialogFooter'

/**
 * The title of the alert dialog.
 *
 * @component
 *
 * @param {Object} props - The component's props.
 * @param {string} [props.className] - Optional additional CSS classes to apply.
 *
 * @returns {JSX.Element} The rendered title element of the dialog.
 */
const AlertDialogTitle = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Title>,
	React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
	<AlertDialogPrimitive.Title
		ref={ref}
		className={cn('text-lg font-semibold', className)}
		{...props}
	/>
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

/**
 * The description or content of the alert dialog.
 *
 * @component
 *
 * @param {Object} props - The component's props.
 * @param {string} [props.className] - Optional additional CSS classes to apply.
 *
 * @returns {JSX.Element} The rendered description element of the dialog.
 */
const AlertDialogDescription = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Description>,
	React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
	<AlertDialogPrimitive.Description
		ref={ref}
		id={props.id || 'alert-dialog-desc'}
		className={cn('text-sm text-muted-foreground', className)}
		{...props}
	/>
))
AlertDialogDescription.displayName =
	AlertDialogPrimitive.Description.displayName

/**
 * The action button in the alert dialog.
 * This button performs the primary action for the dialog, like confirming or accepting.
 *
 * @component
 *
 * @param {Object} props - The component's props.
 * @param {string} [props.className] - Optional additional CSS classes to apply.
 *
 * @returns {JSX.Element} The rendered action button.
 */
const AlertDialogAction = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Action>,
	React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
	<AlertDialogPrimitive.Action
		ref={ref}
		className={cn(buttonVariants(), className)}
		{...props}
	/>
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

/**
 * The cancel button in the alert dialog.
 * This button cancels or closes the dialog without taking any action.
 *
 * @component
 *
 * @param {Object} props - The component's props.
 * @param {string} [props.className] - Optional additional CSS classes to apply.
 *
 * @returns {JSX.Element} The rendered cancel button.
 */
const AlertDialogCancel = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
	React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
	<AlertDialogPrimitive.Cancel
		ref={ref}
		className={cn(
			buttonVariants({ variant: 'outline' }),
			'mt-2 sm:mt-0',
			className,
		)}
		{...props}
	/>
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

export {
	AlertDialog,
	AlertDialogPortal,
	AlertDialogOverlay,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogAction,
	AlertDialogCancel,
}
