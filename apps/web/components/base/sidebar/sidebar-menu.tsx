'use client'

import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { Skeleton } from '~/components/base/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/base/tooltip'
import { cn } from '~/lib/utils'

import { useSidebar } from './context'

export const SidebarMenu = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(
	({ className, ...props }, ref) => (
		<ul
			ref={ref}
			data-sidebar="menu"
			className={cn('flex w-full min-w-0 flex-col gap-1', className)}
			{...props}
		/>
	),
)
SidebarMenu.displayName = 'SidebarMenu'

export const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(
	({ className, ...props }, ref) => (
		<li
			ref={ref}
			data-sidebar="menu-item"
			className={cn('group/menu-item relative', className)}
			{...props}
		/>
	),
)
SidebarMenuItem.displayName = 'SidebarMenuItem'

const sidebarMenuButtonVariants = cva(
	'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
	{
		variants: {
			variant: {
				default: 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
				outline:
					'bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]',
			},
			size: {
				default: 'h-8 text-sm',
				sm: 'h-7 text-xs',
				lg: 'h-12 text-sm group-data-[collapsible=icon]:!p-0',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
)

export const SidebarMenuButton = React.forwardRef<
	HTMLButtonElement,
	React.ComponentProps<'button'> & {
		asChild?: boolean
		isActive?: boolean
		tooltip?: string | React.ComponentProps<typeof TooltipContent>
	} & VariantProps<typeof sidebarMenuButtonVariants>
>(
	(
		{
			asChild = false,
			isActive = false,
			variant = 'default',
			size = 'default',
			tooltip,
			className,
			...props
		},
		ref,
	) => {
		const Comp = asChild ? Slot : 'button'
		const { isMobile, state } = useSidebar()

		const button = (
			<Comp
				ref={ref}
				data-sidebar="menu-button"
				data-size={size}
				data-active={isActive}
				className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
				{...props}
			/>
		)

		if (!tooltip) {
			return button
		}

		if (typeof tooltip === 'string') {
			tooltip = {
				children: tooltip,
			}
		}

		return (
			<Tooltip>
				<TooltipTrigger asChild>{button}</TooltipTrigger>
				<TooltipContent
					side="right"
					align="center"
					hidden={state !== 'collapsed' || isMobile}
					{...tooltip}
				/>
			</Tooltip>
		)
	},
)
SidebarMenuButton.displayName = 'SidebarMenuButton'

export const SidebarMenuAction = React.forwardRef<
	HTMLButtonElement,
	React.ComponentProps<'button'> & {
		asChild?: boolean
		showOnHover?: boolean
	}
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
	const Comp = asChild ? Slot : 'button'

	return (
		<Comp
			ref={ref}
			data-sidebar="menu-action"
			className={cn(
				'absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0',
				'after:absolute after:-inset-2 after:md:hidden',
				'peer-data-[size=sm]/menu-button:top-1',
				'peer-data-[size=default]/menu-button:top-1.5',
				'peer-data-[size=lg]/menu-button:top-2.5',
				'group-data-[collapsible=icon]:hidden',
				showOnHover &&
					'group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0',
				className,
			)}
			{...props}
		/>
	)
})
SidebarMenuAction.displayName = 'SidebarMenuAction'

export const SidebarMenuBadge = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
	({ className, ...props }, ref) => (
		<div
			ref={ref}
			data-sidebar="menu-badge"
			className={cn(
				'absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground select-none pointer-events-none',
				'peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground',
				'peer-data-[size=sm]/menu-button:top-1',
				'peer-data-[size=default]/menu-button:top-1.5',
				'peer-data-[size=lg]/menu-button:top-2.5',
				'group-data-[collapsible=icon]:hidden',
				className,
			)}
			{...props}
		/>
	),
)
SidebarMenuBadge.displayName = 'SidebarMenuBadge'

export const SidebarMenuSkeleton = React.forwardRef<
	HTMLDivElement,
	React.ComponentProps<'div'> & {
		showIcon?: boolean
	}
>(({ className, showIcon = false, ...props }, ref) => {
	// Use a stable width instead of random to avoid impure function during render
	const width = React.useMemo(() => {
		return '75%' // Fixed width instead of random
	}, [])

	return (
		<div
			ref={ref}
			data-sidebar="menu-skeleton"
			className={cn('rounded-md h-8 flex gap-2 px-2 items-center', className)}
			{...props}
		>
			{showIcon && <Skeleton className="size-4 rounded-md" data-sidebar="menu-skeleton-icon" />}
			<Skeleton
				className="h-4 flex-1 max-w-[--skeleton-width]"
				data-sidebar="menu-skeleton-text"
				style={
					{
						'--skeleton-width': width,
					} as React.CSSProperties
				}
			/>
		</div>
	)
})
SidebarMenuSkeleton.displayName = 'SidebarMenuSkeleton'

export const SidebarMenuSub = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(
	({ className, ...props }, ref) => (
		<ul
			ref={ref}
			data-sidebar="menu-sub"
			className={cn(
				'mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5',
				'group-data-[collapsible=icon]:hidden',
				className,
			)}
			{...props}
		/>
	),
)
SidebarMenuSub.displayName = 'SidebarMenuSub'

export const SidebarMenuSubItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(
	({ ...props }, ref) => <li ref={ref} {...props} />,
)
SidebarMenuSubItem.displayName = 'SidebarMenuSubItem'

export const SidebarMenuSubButton = React.forwardRef<
	HTMLAnchorElement,
	React.ComponentProps<'a'> & {
		asChild?: boolean
		size?: 'sm' | 'md'
		isActive?: boolean
	}
>(({ asChild = false, size = 'md', isActive, className, ...props }, ref) => {
	const Comp = asChild ? Slot : 'a'

	return (
		<Comp
			ref={ref}
			data-sidebar="menu-sub-button"
			data-size={size}
			data-active={isActive}
			className={cn(
				'flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground',
				'data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground',
				size === 'sm' && 'text-xs',
				size === 'md' && 'text-sm',
				'group-data-[collapsible=icon]:hidden',
				className,
			)}
			{...props}
		/>
	)
})
SidebarMenuSubButton.displayName = 'SidebarMenuSubButton'
