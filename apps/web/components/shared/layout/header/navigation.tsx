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
import { useI18n } from '~/lib/i18n/context'
import type { NavigationItem } from '~/lib/types'
import { cn } from '~/lib/utils'

export function Navigation() {
	const pathname = usePathname()
	const { t } = useI18n()

	const projects: NavigationItem[] = [
		{
			title: t('nav.exploreProjects'),
			href: '/projects',
			description: t('nav.exploreProjectsDesc'),
		},
		{
			title: t('nav.createProject'),
			href: '/create-project',
			description: t('nav.createProjectDesc'),
		},
	]

	const resources: NavigationItem[] = []

	return (
		<NavigationMenu aria-label="Main navigation">
			<NavigationMenuList>
			<NavigationMenuItem>
				<NavigationMenuTrigger
					aria-label={t('aria.projectsMenu')}
					label={t('aria.projectsMenu')}
				>
					{t('nav.projects')}
				</NavigationMenuTrigger>
				<NavigationMenuContent aria-label={t('aria.projectOptions')}>
						<ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
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

			{resources.length > 0 && (
				<NavigationMenuItem>
					<NavigationMenuTrigger
						aria-label={t('aria.resourcesMenu')}
						label={t('aria.resourcesMenu')}
					>
						{t('nav.resources')}
					</NavigationMenuTrigger>

					<NavigationMenuContent aria-label={t('aria.resourceOptions')}>
							<ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
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
			)}

			<NavigationMenuItem>
				<Link href="/about" passHref>
					<NavigationMenuLink
						className={cn(
							navigationMenuTriggerStyle(),
							pathname === '/about' && 'text-primary',
						)}
						aria-label={t('nav.about')}
						aria-current={pathname === '/about' ? 'page' : undefined}
					>
						{t('nav.about')}
					</NavigationMenuLink>
				</Link>
			</NavigationMenuItem>

			<NavigationMenuItem>
				<Link href="/news" passHref>
					<NavigationMenuLink
						className={cn(
							navigationMenuTriggerStyle(),
							pathname?.startsWith('/news') && 'text-primary',
						)}
						aria-current={pathname?.startsWith('/news') ? 'page' : undefined}
					>
						{t('nav.news')}
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
						'block p-3 space-y-1 leading-none no-underline rounded-md transition-colors outline-none select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
						className,
					)}
					{...props}
				>
					<div className="text-sm font-medium leading-none">{title}</div>
					<p className="text-sm leading-snug line-clamp-2 text-muted-foreground">
						{children}
					</p>
				</a>
			</NavigationMenuLink>
		</li>
	)
})
ListItem.displayName = 'ListItem'
