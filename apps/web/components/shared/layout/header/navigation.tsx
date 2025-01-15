'use client'

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

const projects = [
	{
		title: 'Explore Projects',
		href: '/projects',
		description: 'Discover verified social initiatives powered by blockchain',
	},
	{
		title: 'Create a Project',
		href: '/create',
		description: 'Start your social impact campaign with Web3 technology',
	},
	{
		title: 'Featured Projects',
		href: '/featured',
		description: 'Explore the most successful initiatives from our community',
	},
]

const resources = [
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
		<NavigationMenu>
			<NavigationMenuList>
				<NavigationMenuItem>
					<NavigationMenuTrigger>Projects</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
							{projects.map((project) => (
								<ListItem
									key={project.title}
									title={project.title}
									href={project.href}
								>
									{project.description}
								</ListItem>
							))}
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>

				<NavigationMenuItem>
					<NavigationMenuTrigger>Resources</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
							{resources.map((resource) => (
								<ListItem
									key={resource.title}
									title={resource.title}
									href={resource.href}
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
