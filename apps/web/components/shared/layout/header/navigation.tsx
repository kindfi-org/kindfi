'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	navigationMenuTriggerStyle,
} from '~/components/base/navigation-menu'
import { useI18n } from '~/lib/i18n/context'
import { cn } from '~/lib/utils'

export function Navigation() {
	const pathname = usePathname()
	const { t } = useI18n()

	const isActive = (path: string) => {
		if (path === '/projects') {
			return pathname === '/projects' || pathname?.startsWith('/projects/')
		}
		if (path === '/foundations') {
			return (
				pathname === '/foundations' || pathname?.startsWith('/foundations/')
			)
		}
		if (path === '/about') {
			return pathname === '/about'
		}
		if (path === '/news') {
			return pathname?.startsWith('/news')
		}
		return false
	}

	return (
		<NavigationMenu aria-label="Main navigation">
			<NavigationMenuList>
				<NavigationMenuItem>
					<Link href="/projects" passHref>
						<NavigationMenuLink
							className={cn(
								navigationMenuTriggerStyle(),
								'data-[active]:bg-green-900/10 data-[active]:text-green-900',
								'hover:bg-green-900/10 hover:text-green-900',
								isActive('/projects') &&
									'bg-green-900/10 text-green-900 font-medium',
							)}
							aria-label={t('nav.projects')}
							aria-current={isActive('/projects') ? 'page' : undefined}
						>
							{t('nav.projects')}
						</NavigationMenuLink>
					</Link>
				</NavigationMenuItem>

				<NavigationMenuItem>
					<Link href="/foundations" passHref>
						<NavigationMenuLink
							className={cn(
								navigationMenuTriggerStyle(),
								'data-[active]:bg-green-900/10 data-[active]:text-green-900',
								'hover:bg-green-900/10 hover:text-green-900',
								isActive('/foundations') &&
									'bg-green-900/10 text-green-900 font-medium',
							)}
							aria-label={t('nav.foundations')}
							aria-current={isActive('/foundations') ? 'page' : undefined}
						>
							{t('nav.foundations')}
						</NavigationMenuLink>
					</Link>
				</NavigationMenuItem>

				<NavigationMenuItem>
					<Link href="/about" passHref>
						<NavigationMenuLink
							className={cn(
								navigationMenuTriggerStyle(),
								'data-[active]:bg-green-900/10 data-[active]:text-green-900',
								'hover:bg-green-900/10 hover:text-green-900',
								isActive('/about') &&
									'bg-green-900/10 text-green-900 font-medium',
							)}
							aria-label={t('nav.about')}
							aria-current={isActive('/about') ? 'page' : undefined}
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
								'data-[active]:bg-green-900/10 data-[active]:text-green-900',
								'hover:bg-green-900/10 hover:text-green-900',
								isActive('/news') &&
									'bg-green-900/10 text-green-900 font-medium',
							)}
							aria-current={isActive('/news') ? 'page' : undefined}
						>
							{t('nav.news')}
						</NavigationMenuLink>
					</Link>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	)
}
