'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import * as React from 'react'
import useReducedMotion from '~/hooks/use-reduced-motion'
import { animations } from '~/lib/animations'
import { cn } from '~/lib/utils'

/**
 * https://ui.shadcn.com/docs/components/dialog
 * Root Dialog component that manages the dialog's open state.
 * Built on top of Radix UI's Dialog primitive.
 *
 * @component
 * @example
 * <Dialog>
 *   <DialogTrigger>Open</DialogTrigger>
 *   <DialogContent>Dialog content</DialogContent>
 * </Dialog>
 */
const Dialog = DialogPrimitive.Root

/**
 * Button that opens the dialog when clicked.
 *
 * @component
 * @example
 * <DialogTrigger>Open Dialog</DialogTrigger>
 */
const DialogTrigger = DialogPrimitive.Trigger

/**
 * Portal component that renders the dialog in a separate DOM node.
 * Ensures proper stacking context and z-index handling.
 *
 * @component
 */
const DialogPortal = DialogPrimitive.Portal

/**
 * Button that closes the dialog when clicked.
 *
 * @component
 * @example
 * <DialogClose>Close Dialog</DialogClose>
 */

const DialogClose = DialogPrimitive.Close

/**
 * DialogOverlay component for the background overlay of the dialog.
 *
 * @accessibility
 * - Provides a semi-transparent backdrop that helps maintain focus within the dialog
 * - Clicking the overlay closes the dialog by default
 * - Helps create a focus trap within the dialog
 *
 * @param {React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>} props - The properties for the overlay.
 * @param {React.Ref} ref - The reference to the overlay element.
 *
 * @returns {JSX.Element} The rendered overlay component.
 */
const DialogOverlay = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
    
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Overlay
		ref={ref}
		className={cn(
			'fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out',
			className,
		)}
		{...props}
	/>
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

/**
 * DialogContent component for the main content of the dialog.
 *
 * @param {React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>} props - The properties for the dialog content.
 * @param {React.Ref} ref - The reference to the content element.
 *
 * @returns {JSX.Element} The rendered content of the dialog.
 */
const DialogContent = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
	<DialogPortal>
		<DialogOverlay />
		<DialogPrimitive.Content

>(({ className, ...props }, ref) => {
	const reducedMotion = useReducedMotion()
	return (
		<DialogPrimitive.Overlay

			ref={ref}
			className={cn(
				'fixed inset-0 z-50',
				reducedMotion
					? 'bg-black/80'
					: animations.fadeAndAnimateAndOverlay.inOut,
				className,
			)}
			{...props}
		/>
	)
})
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
	const reducedMotion = useReducedMotion()

	return (
		<DialogPortal>
			<DialogOverlay />
			<DialogPrimitive.Content
				ref={ref}
				className={cn(
					'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-default',
					reducedMotion ? '' : animations.fadeAndAnimate.inOut,
					'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
					className,
				)}
				aria-labelledby="dialog-title"
				aria-describedby="dialog-description"
				{...props}
			>
				{children}
				<DialogPrimitive.Close
					className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
					aria-label="Close dialog button. Click to close the dialog"
				>
					<X className="h-4 w-4" />
					<span className="sr-only">Close</span>
				</DialogPrimitive.Close>
			</DialogPrimitive.Content>
		</DialogPortal>
	)
})
DialogContent.displayName = DialogPrimitive.Content.displayName

/**
 * DialogHeader component for the header section of the dialog.
 *
 * @param {React.HTMLAttributes<HTMLDivElement>} props - The properties for the header.
 *
 * @returns {JSX.Element} The rendered dialog header.
 */
const DialogHeader = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			'flex flex-col space-y-1.5 text-center sm:text-left',
			className,
		)}
		{...props}
	/>
)
DialogHeader.displayName = 'DialogHeader'

/**
 * DialogFooter component for the footer section of the dialog.
 *
 * @param {React.HTMLAttributes<HTMLDivElement>} props - The properties for the footer.
 *
 * @returns {JSX.Element} The rendered dialog footer.
 */
const DialogFooter = ({
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
DialogFooter.displayName = 'DialogFooter'

/**
 * DialogTitle component for the title of the dialog.
 *
 * @param {React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>} props - The properties for the title.
 * @param {React.Ref} ref - The reference to the title element.
 *
 * @returns {JSX.Element} The rendered title of the dialog.
 */
const DialogTitle = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Title>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Title
		id="dialog-title"
		ref={ref}
		className={cn(
			'text-lg font-semibold leading-none tracking-tight',
			className,
		)}
		{...props}
	/>
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

/**
 * DialogDescription component for the description of the dialog.
 *
 * @param {React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>} props - The properties for the description.
 * @param {React.Ref} ref - The reference to the description element.
 *
 * @returns {JSX.Element} The rendered description of the dialog.
 */
const DialogDescription = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Description>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Description
		ref={ref}
		id="dialog-description"
		className={cn('text-sm text-muted-foreground', className)}
		{...props}
	/>
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
	Dialog,
	DialogPortal,
	DialogOverlay,
	DialogTrigger,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
}
