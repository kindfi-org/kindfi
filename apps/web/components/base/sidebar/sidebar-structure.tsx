'use client'

import { Slot } from '@radix-ui/react-slot'
import * as React from 'react'

import { Separator } from '~/components/base/separator'
import { cn } from '~/lib/utils'

export const SidebarHeader = React.forwardRef<
	HTMLDivElement,
	React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
	return (
		<div
			ref={ref}
			data-sidebar="header"
			className={cn('flex flex-col gap-2 p-2', className)}
			{...props}
		/>
	)
})
SidebarHeader.displayName = 'SidebarHeader'

export const SidebarFooter = React.forwardRef<
	HTMLDivElement,
	React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
	return (
		<div
			ref={ref}
			data-sidebar="footer"
			className={cn('flex flex-col gap-2 p-2', className)}
			{...props}
		/>
	)
})
SidebarFooter.displayName = 'SidebarFooter'

export const SidebarSeparator = React.forwardRef<
	React.ElementRef<typeof Separator>,
	React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
	return (
		<Separator
			ref={ref}
			data-sidebar="separator"
			className={cn('mx-2 w-auto bg-sidebar-border', className)}
			{...props}
		/>
	)
})
SidebarSeparator.displayName = 'SidebarSeparator'

export const SidebarContent = React.forwardRef<
	HTMLDivElement,
	React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
	return (
		<div
			ref={ref}
			data-sidebar="content"
			className={cn(
				'flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden',
				className,
			)}
			{...props}
		/>
	)
})
SidebarContent.displayName = 'SidebarContent'

export const SidebarGroup = React.forwardRef<
	HTMLDivElement,
	React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
	return (
		<div
			ref={ref}
			data-sidebar="group"
			className={cn('relative flex w-full min-w-0 flex-col p-2', className)}
			{...props}
		/>
	)
})
SidebarGroup.displayName = 'SidebarGroup'

export const SidebarGroupLabel = React.forwardRef<
	HTMLDivElement,
	React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
	const Comp = asChild ? Slot : 'div'

	return (
		<Comp
			ref={ref}
			data-sidebar="group-label"
			className={cn(
				'flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring [&>svg]:size-4 [&>svg]:shrink-0',
				'transition-opacity duration-200 ease-in-out will-change-[opacity,margin]',
				'group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:-mt-8 motion-reduce:transition-none',
				className,
			)}
			{...props}
		/>
	)
})
SidebarGroupLabel.displayName = 'SidebarGroupLabel'

export const SidebarGroupAction = React.forwardRef<
	HTMLButtonElement,
	React.ComponentProps<'button'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
	const Comp = asChild ? Slot : 'button'

	return (
		<Comp
			ref={ref}
			data-sidebar="group-action"
			className={cn(
				'absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
				'after:absolute after:-inset-2 after:md:hidden',
				'group-data-[collapsible=icon]:hidden',
				className,
			)}
			{...props}
		/>
	)
})
SidebarGroupAction.displayName = 'SidebarGroupAction'

export const SidebarGroupContent = React.forwardRef<
	HTMLDivElement,
	React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		data-sidebar="group-content"
		className={cn('w-full text-sm', className)}
		{...props}
	/>
))
SidebarGroupContent.displayName = 'SidebarGroupContent'
