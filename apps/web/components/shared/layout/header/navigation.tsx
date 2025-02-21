'use client'
import type { NavigationItem } from '~/lib/types'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as React from 'react'
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from '~/components/base/navigation-menu'
import { cn } from '~/lib/utils'

const projects: NavigationItem[] = [
	{
		title: 'Explore Projects',
		href: '/projects',
		description: 'Discover verified social initiatives powered by blockchain',
	},
	{
		title: 'Create a Project',
		href: '/create-project',
		description: 'Start your social impact campaign with Web3 technology',
	},
	{
		title: 'Featured Projects',
		href: '/featured',
		description: 'Explore the most successful initiatives from our community',
	},
]

const resources: NavigationItem[] = [
	{
		title: 'Learn Web3',
		href: '/learn',
		description:
			'Access guides and resources to understand blockchain and crypto',
	},
	{
		title: 'Community',
		href: '/community',
		description: 'Join our decentralized and collaborative community',
	},
	{
		title: 'Social Impact',
		href: '/impact',
		description: 'Track metrics and results from impactful social projects',
	},
]

export function Navigation() {
	const pathname = usePathname()

	return (
		<NavigationMenu aria-label="Main navigation">
			<NavigationMenuList>
				<NavigationMenuItem>
					<NavigationMenuTrigger
						aria-label="Projects menu"
						label="Projects menu"
					>
						Projects
					</NavigationMenuTrigger>
					<NavigationMenuContent aria-label="Project options list">
						<ul
							className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]"
							role="menu"
						>
							{projects.map((project) => (
								<ListItem
									key={project.title}
									title={project.title}
									href={project.href}
									role="menuitem"
									aria-label={`${project.title}: ${project.description}`}
								>
									{project.description}
								</ListItem>
							))}
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>

				<NavigationMenuItem>
					<NavigationMenuTrigger
						aria-label="Resources menu"
						label="Resources menu"
					>
						Resources
					</NavigationMenuTrigger>

					<NavigationMenuContent aria-label="Resource options list">
						<ul
							className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]"
							role="menu"
						>
							{resources.map((resource) => (
								<ListItem
									key={resource.title}
									title={resource.title}
									href={resource.href}
									role="menuitem"
									aria-label={`${resource.title}: ${resource.description}`}
								>
									{resource.description}
								</ListItem>
							))}
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>

				<NavigationMenuItem>
					<Link href="/about" legacyBehavior passHref>
						<NavigationMenuLink
							className={cn(
								navigationMenuTriggerStyle(),
								pathname === '/about' && 'text-primary',
							)}
							aria-label="About KindFi"
							aria-current={pathname === '/about' ? 'page' : undefined}
						>
							About KindFi
						</NavigationMenuLink>
					</Link>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	)
}

const ListItem = React.forwardRef<
	React.ElementRef<'a'>,
	React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, ...props }, ref) => {
	return (
		<li>
			<NavigationMenuLink asChild>
				<a
					ref={ref}
					className={cn(
						'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
						className,
					)}
					{...props}
				>
					<div className="text-sm font-medium leading-none">{title}</div>
					<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
						{children}
					</p>
				</a>
			</NavigationMenuLink>
		</li>
	)
})
ListItem.displayName = 'ListItem'
