'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import * as React from 'react'

import { cn } from '~/lib/utils'

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

const DialogContent = React.forwardRef<
	HTMLDialogElement,
	React.ComponentPropsWithoutRef<'dialog'>
>(({ className, children, ...props }, ref) => {
	const fallbackTitleId = React.useId()
	const fallbackDescriptionId = React.useId()

	const mergedTitleId = props['aria-labelledby'] || fallbackTitleId
	const mergedDescriptionId = props['aria-describedby'] || fallbackDescriptionId

	return (
		<DialogPrimitive.Portal>
			<DialogOverlay />
			<dialog
				ref={ref}
				open={props.open}
				aria-labelledby={mergedTitleId}
				aria-describedby={mergedDescriptionId}
				className={cn(
					'fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg',
					className,
				)}
				{...props}
			>
				{children}
				<DialogPrimitive.Close
					className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					aria-label="Close"
				>
					<X className="h-4 w-4" />
					<span className="sr-only">Close</span>
				</DialogPrimitive.Close>
			</dialog>
		</DialogPrimitive.Portal>
	)
})
DialogContent.displayName = 'DialogContent'

export { DialogContent, DialogOverlay }
