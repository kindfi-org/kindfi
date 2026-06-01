'use client'

import { PanelLeft } from 'lucide-react'
import * as React from 'react'

import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import { Sheet, SheetContent } from '~/components/base/sheet'
import useReducedMotion from '~/hooks/use-reduced-motion'
import { cn } from '~/lib/utils'

import {
	getSidebarStyles,
	getSidebarStylesTwo,
	SIDEBAR_WIDTH_MOBILE,
} from './constants'
import { useSidebar } from './context'

/**
 *  ShadCN/UI Reference:https://ui.shadcn.com/docs/components/sidebar
 * Sidebar component for managing sidebar state, layout, and behavior.
 * @component
 * @param {Object} props - Component props
 * @param {'left' | 'right'} [props.side='left'] - The side where the sidebar appears
 * @param {'sidebar' | 'floating' | 'inset'} [props.variant='sidebar'] - The visual style variant of the sidebar
 * @param {'offcanvas' | 'icon' | 'none'} [props.collapsible='offcanvas'] - The collapse behavior of the sidebar
 * @param {ReactNode} props.children - Sidebar content
 * @example
 * <Sidebar variant="floating" side="right">
 *   <p>Sidebar Content</p>
 * </Sidebar>
 */
export const Sidebar = React.forwardRef<
	HTMLDivElement,
	React.ComponentProps<'div'> & {
		side?: 'left' | 'right'
		variant?: 'sidebar' | 'floating' | 'inset'
		collapsible?: 'offcanvas' | 'icon' | 'none'
	}
>(
	(
		{
			side = 'left',
			variant = 'sidebar',
			collapsible = 'offcanvas',
			className,
			children,
			...props
		},
		ref,
	) => {
		const { isMobile, state, openMobile, setOpenMobile } = useSidebar()
		const reducedMotion = useReducedMotion()
		const SIDEBAR_STYLES = getSidebarStyles(reducedMotion)
		const SIDEBAR_STYLES_TWO = getSidebarStylesTwo(reducedMotion)
		if (collapsible === 'none') {
			return (
				<div
					className={cn(
						'flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground',
						className,
					)}
					ref={ref}
					{...props}
				>
					{children}
				</div>
			)
		}

		if (isMobile) {
			return (
				<Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
					<SheetContent
						data-sidebar="sidebar"
						data-mobile="true"
						className="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
						style={
							{
								'--sidebar-width': SIDEBAR_WIDTH_MOBILE,
							} as React.CSSProperties
						}
						side={side}
					>
						<div className="flex h-full w-full flex-col">{children}</div>
					</SheetContent>
				</Sheet>
			)
		}

		return (
			<div
				ref={ref}
				className="group peer hidden md:block text-sidebar-foreground"
				data-state={state}
				data-collapsible={state === 'collapsed' ? collapsible : ''}
				data-variant={variant}
				data-side={side}
			>
				<div
					style={{
						...SIDEBAR_STYLES,
						transform: state === 'expanded' ? 'scaleX(1)' : 'scaleX(0)',
						opacity: state === 'expanded' ? 1 : 0,
					}}
					className={cn(
						'relative h-svh w-[--sidebar-width] bg-transparent',
						'group-data-[collapsible=offcanvas]:w-0',
						'group-data-[side=right]:rotate-180',
						variant === 'floating' || variant === 'inset'
							? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]'
							: 'group-data-[collapsible=icon]:w-[--sidebar-width-icon]',
					)}
				/>
				<div
					className={cn(
						'fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] md:flex',
						'transform-gpu will-change-transform',
						side === 'left'
							? '-translate-x-full left-0 group-data-[collapsible=offcanvas]:translate-x-0'
							: 'translate-x-full right-0 group-data-[collapsible=offcanvas]:translate-x-0',
						// Adjust the padding for floating and inset variants.
						variant === 'floating' || variant === 'inset'
							? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]'
							: 'group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l',
						className,
					)}
					style={{
						...SIDEBAR_STYLES_TWO,

						...props.style,
					}}
					{...props}
				>
					<div
						data-sidebar="sidebar"
						className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
					>
						{children}
					</div>
				</div>
			</div>
		)
	},
)
Sidebar.displayName = 'Sidebar'

export const SidebarTrigger = React.forwardRef<
	React.ElementRef<typeof Button>,
	React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
	const { toggleSidebar } = useSidebar()

	return (
		<Button
			ref={ref}
			data-sidebar="trigger"
			variant="ghost"
			size="icon"
			className={cn('h-7 w-7', className)}
			onClick={(event) => {
				onClick?.(event)
				toggleSidebar()
			}}
			{...props}
		>
			<PanelLeft />
			<span className="sr-only">Toggle Sidebar</span>
		</Button>
	)
})
SidebarTrigger.displayName = 'SidebarTrigger'

export const SidebarRail = React.forwardRef<
	HTMLButtonElement,
	React.ComponentProps<'button'>
>(({ className, ...props }, ref) => {
	const { toggleSidebar } = useSidebar()

	return (
		<button
			ref={ref}
			data-sidebar="rail"
			aria-label="Toggle Sidebar"
			tabIndex={-1}
			onClick={toggleSidebar}
			title="Toggle Sidebar"
			className={cn(
				'absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex',
				'[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize',
				'[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize',
				'group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar',
				'[[data-side=left][data-collapsible=offcanvas]_&]:-right-2',
				'[[data-side=right][data-collapsible=offcanvas]_&]:-left-2',
				className,
			)}
			{...props}
		/>
	)
})
SidebarRail.displayName = 'SidebarRail'

export const SidebarInset = React.forwardRef<
	HTMLDivElement,
	React.ComponentProps<'main'>
>(({ className, ...props }, ref) => {
	return (
		<main
			ref={ref}
			className={cn(
				'relative flex min-h-svh flex-1 flex-col bg-background',
				'peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow',
				className,
			)}
			{...props}
		/>
	)
})
SidebarInset.displayName = 'SidebarInset'

export const SidebarInput = React.forwardRef<
	React.ElementRef<typeof Input>,
	React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => {
	return (
		<Input
			ref={ref}
			data-sidebar="input"
			className={cn(
				'h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
				className,
			)}
			{...props}
		/>
	)
})
SidebarInput.displayName = 'SidebarInput'
