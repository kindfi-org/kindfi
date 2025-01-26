'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import * as React from 'react'

import { cn } from '~/lib/utils'
/**
 * Tabs component to manage tabbed navigation and content switching.
 * @component
 * @example
 * <Tabs defaultValue="tab1">
 *   <TabsList>
 *     <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 *     <TabsTrigger value="tab2">Tab 2</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="tab1">Tab 1 Content</TabsContent>
 *   <TabsContent value="tab2">Tab 2 Content</TabsContent>
 * </Tabs>
 */
const Tabs = TabsPrimitive.Root

/**
 * TabsList component to render the list of tabs (tab navigation).
 * @component
 * @param {React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>} props - The component props
 * @param {string} [props.className] - Additional custom CSS classes for styling the list
 * @example
 * <TabsList>
 *   <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 *   <TabsTrigger value="tab2">Tab 2</TabsTrigger>
 * </TabsList>
 */
const TabsList = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.List>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.List
		ref={ref}
		className={cn(
			'inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
			className,
		)}
		{...props}
	/>
))
TabsList.displayName = TabsPrimitive.List.displayName

/**
 * TabsTrigger component to represent a clickable tab that triggers content change.
 * @component
 * @param {React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>} props - The component props
 * @param {string} [props.className] - Additional custom CSS classes for styling the trigger
 * @example
 * <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 */
const TabsTrigger = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.Trigger
		ref={ref}
		className={cn(
			'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow',
			className,
		)}
		{...props}
	/>
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

/**
 * TabsContent component to display the content for a specific tab.
 * @component
 * @param {React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>} props - The component props
 * @param {string} [props.className] - Additional custom CSS classes for styling the content
 * @example
 * <TabsContent value="tab1">Tab 1 Content</TabsContent>
 */
const TabsContent = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.Content
		ref={ref}
		className={cn(
			'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
			className,
		)}
		{...props}
	/>
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
