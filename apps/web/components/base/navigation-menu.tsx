import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu'
import { type VariantProps, cva } from 'class-variance-authority'
import { ChevronDown } from 'lucide-react'
import * as React from 'react'

import { cn } from '~/lib/utils'
/**/
interface NavigationItem {
	label: string
	href: string
	ariaLabel: string
}

const navigationMenuTriggerStyle = cva(
	'group inline-flex items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50',
	{
		variants: {
			size: {
				sm: 'h-8 text-sm',
				md: 'h-10 text-base',
				lg: 'h-12 text-lg',
			},
			direction: {
				down: '',
				up: 'flex-col-reverse',
				left: 'flex-row-reverse',
				right: 'flex-row',
			},
		},
		defaultVariants: {
			size: 'md',
			direction: 'down',
		},
	},
)

const NavigationMenu = React.forwardRef<
	React.ElementRef<typeof NavigationMenuPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root> & {
		onOpenChange?: (open: boolean) => void
	}
>(({ className, children, onOpenChange, ...props }, ref) => {
	const handleValueChange = (value: string) => {
		if (onOpenChange) {
			onOpenChange(!!value)
		}
	}

	return (
		<nav
			className={cn(
				'relative z-10 flex max-w-max flex-1 items-center justify-center',
				className,
			)}
		>
			<NavigationMenuPrimitive.Root
				ref={ref}
				className="w-full"
				onValueChange={handleValueChange}
				aria-label="Main navigation"
				{...props}
			>
				{children}
				<NavigationMenuViewport />
			</NavigationMenuPrimitive.Root>
		</nav>
	)
})
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName

const NavigationMenuList = React.forwardRef<
	React.ElementRef<typeof NavigationMenuPrimitive.List>,
	React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
	<NavigationMenuPrimitive.List
		ref={ref}
		className={cn(
			'group flex flex-1 list-none items-center justify-center space-x-1',
			className,
		)}
		aria-label="Navigation menu items"
		{...props}
	/>
))
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName

const NavigationMenuItem = NavigationMenuPrimitive.Item

type TriggerProps = React.ComponentPropsWithoutRef<
	typeof NavigationMenuPrimitive.Trigger
> & {
	'data-state'?: 'open' | 'closed'
}

const NavigationMenuTrigger = React.forwardRef<
	React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
	TriggerProps &
		VariantProps<typeof navigationMenuTriggerStyle> & {
			label: string
		}
>(({ className, children, size, direction, label, ...props }, ref) => (
	<NavigationMenuPrimitive.Trigger
		ref={ref}
		className={cn(navigationMenuTriggerStyle({ size, direction }), className)}
		aria-expanded={props['data-state'] === 'open'}
		aria-label={label}
		{...props}
	>
		{children}
		<ChevronDown
			className="ml-1 h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180"
			aria-hidden="true"
		/>
	</NavigationMenuPrimitive.Trigger>
))
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName

const NavigationMenuContent = React.forwardRef<
	React.ElementRef<typeof NavigationMenuPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
	<NavigationMenuPrimitive.Content
		ref={ref}
		className={cn(
			'left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto ',
			className,
		)}
		{...props}
	/>
))
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName

const NavigationMenuLink = NavigationMenuPrimitive.Link

const NavigationMenuViewport = React.forwardRef<
	React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
	React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
	<div className={cn('absolute left-0 top-full flex justify-center')}>
		<NavigationMenuPrimitive.Viewport
			ref={ref}
			className={cn(
				'origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]',
				className,
			)}
			{...props}
		/>
	</div>
))
NavigationMenuViewport.displayName =
	NavigationMenuPrimitive.Viewport.displayName

const NavigationMenuIndicator = React.forwardRef<
	React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
	React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
	<NavigationMenuPrimitive.Indicator
		ref={ref}
		className={cn(
			'top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in',
			className,
		)}
		{...props}
	>
		<div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
	</NavigationMenuPrimitive.Indicator>
))
NavigationMenuIndicator.displayName =
	NavigationMenuPrimitive.Indicator.displayName

const SkeletonItem = () => (
	<div className="h-10 w-full animate-pulse rounded bg-gray-200" />
)

export {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuIndicator,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
	NavigationMenuViewport,
	SkeletonItem,
}
