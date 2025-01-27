'use client'

import * as AvatarPrimitive from '@radix-ui/react-avatar'
import * as React from 'react'

import { cn } from '~/lib/utils'

/**
 * `Avatar` component is a wrapper that provides a container for an avatar image.
 * It supports custom styles and handles the layout of the avatar.
 *
 * @component
 * @accessibility
 * - Uses ARIA attributes for better screen reader support
 * - Keyboard navigation support through Radix UI primitives
 * @example
 * <Avatar>
 *   <AvatarImage src="avatar.jpg" alt="User Avatar" />
 *   <AvatarFallback>AB</AvatarFallback>
 * </Avatar>
 *
 * @param {React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>} props - The props for the `Avatar` component.
 * @param {string} [props.className] - Additional class names to apply custom styles to the avatar container.
 * @param {React.Ref} ref - The ref to forward to the avatar container element.
 * @returns {JSX.Element} The rendered avatar component.
 */
const Avatar = React.forwardRef<
	React.ElementRef<typeof AvatarPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
	<AvatarPrimitive.Root
		ref={ref}
		className={cn(
			'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
			className,
		)}
		{...props}
	/>
))
Avatar.displayName = AvatarPrimitive.Root.displayName

/**
 * `AvatarImage` component is used to display the image part of the avatar.
 * It ensures the image is square-shaped and fills the container.
 *
 * @component
 * @example
 * <AvatarImage src="avatar.jpg" alt="User Avatar" />
 *
 * @param {React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>} props - The props for the `AvatarImage` component.
 * @param {string} props.src - Required. The source URL for the avatar image.
 * @param {string} props.alt - Required. The alt text for the avatar image for accessibility.
 * @param {string} [props.className] - Additional class names to apply custom styles to the image.
 * @param {React.Ref} ref - The ref to forward to the avatar image element.
 * @returns {JSX.Element} The rendered avatar image component.
 */
const AvatarImage = React.forwardRef<
	React.ElementRef<typeof AvatarPrimitive.Image>,
	React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
	<AvatarPrimitive.Image
		ref={ref}
		className={cn('aspect-square h-full w-full', className)}
		{...props}
	/>
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

/**
 * `AvatarFallback` component is displayed when the avatar image is not available.
 * It provides a fallback display, such as initials or a placeholder icon.
 * 
 * The fallback is shown in the following scenarios:
 * - While the image is loading
 * - If the image fails to load
 * - When no image source is provided
 *
 * @component
 * @example
 * <AvatarFallback>AB</AvatarFallback>
 *
 * @param {React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>} props - The props for the `AvatarFallback` component.
 * @param {string} [props.className] - Additional class names to apply custom styles to the fallback element.
 * @param {React.Ref} ref - The ref to forward to the fallback element.
 * @returns {JSX.Element} The rendered fallback component.
 */
const AvatarFallback = React.forwardRef<
	React.ElementRef<typeof AvatarPrimitive.Fallback>,
	React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
	<AvatarPrimitive.Fallback
		ref={ref}
		className={cn(
			'flex h-full w-full items-center justify-center rounded-full bg-muted',
			className,
		)}
		{...props}
	/>
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarFallback, AvatarImage }
