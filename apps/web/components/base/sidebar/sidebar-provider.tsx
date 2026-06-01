'use client'

import * as React from 'react'

import { TooltipProvider } from '~/components/base/tooltip'
import { useIsMobile } from '~/hooks/use-mobile'
import { cn } from '~/lib/utils'

import {
	SIDEBAR_COOKIE_MAX_AGE,
	SIDEBAR_COOKIE_NAME,
	SIDEBAR_KEYBOARD_SHORTCUT,
	SIDEBAR_WIDTH,
	SIDEBAR_WIDTH_ICON,
} from './constants'
import { SidebarContext, type SidebarContext as SidebarContextType } from './context'

/**
 * SidebarProvider component to manage and provide sidebar state.
 * @component
 * @param {Object} props - Component props
 * @param {boolean} [props.defaultOpen=true] - Default state of the sidebar (expanded)
 * @param {boolean} [props.open] - Controlled open state of the sidebar
 * @param {Function} [props.onOpenChange] - Callback to handle the open state change
 * @param {ReactNode} props.children - Sidebar content
 * @example
 * <SidebarProvider defaultOpen={true}>
 *   <Sidebar>
 *     <p>Sidebar Content</p>
 *   </Sidebar>
 * </SidebarProvider>
 */
export const SidebarProvider = React.forwardRef<
	HTMLDivElement,
	React.ComponentProps<'div'> & {
		defaultOpen?: boolean
		open?: boolean
		onOpenChange?: (open: boolean) => void
	}
>(
	(
		{
			defaultOpen = true,
			open: openProp,
			onOpenChange: setOpenProp,
			className,
			style,
			children,
			...props
		},
		ref,
	) => {
		const isMobile = useIsMobile()
		const [openMobile, setOpenMobile] = React.useState(false)

		// This is the internal state of the sidebar.
		// We use openProp and setOpenProp for control from outside the component.
		const [_open, _setOpen] = React.useState(defaultOpen)
		const open = openProp ?? _open
		const setOpen = React.useCallback(
			(value: boolean | ((value: boolean) => boolean)) => {
				const openState = typeof value === 'function' ? value(open) : value
				if (setOpenProp) {
					setOpenProp(openState)
				} else {
					_setOpen(openState)
				}

				// biome-ignore lint/suspicious/noDocumentCookie: no doc
				document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
			},
			[open, setOpenProp],
		)

		const toggleSidebar = React.useCallback(() => {
			return isMobile
				? setOpenMobile((open) => !open)
				: setOpen((open) => !open)
		}, [isMobile, setOpen])

		React.useEffect(() => {
			const handleKeyDown = (event: KeyboardEvent) => {
				if (
					event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
					(event.metaKey || event.ctrlKey)
				) {
					event.preventDefault()
					toggleSidebar()
				}
			}

			window.addEventListener('keydown', handleKeyDown)
			return () => window.removeEventListener('keydown', handleKeyDown)
		}, [toggleSidebar])

		const state = open ? 'expanded' : 'collapsed'

		const contextValue = React.useMemo<SidebarContextType>(
			() => ({
				state,
				open,
				setOpen,
				isMobile,
				openMobile,
				setOpenMobile,
				toggleSidebar,
			}),
			[state, open, setOpen, isMobile, openMobile, toggleSidebar],
		)

		return (
			<SidebarContext.Provider value={contextValue}>
				<TooltipProvider delayDuration={0}>
					<div
						style={
							{
								'--sidebar-width': SIDEBAR_WIDTH,
								'--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
								...style,
							} as React.CSSProperties
						}
						className={cn(
							'group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar',
							className,
						)}
						ref={ref}
						{...props}
					>
						{children}
					</div>
				</TooltipProvider>
			</SidebarContext.Provider>
		)
	},
)
SidebarProvider.displayName = 'SidebarProvider'
