'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '~/lib/utils'

const links: { href: (slug: string) => string; label: string }[] = [
	{ href: (slug) => `/projects/${slug}/manage`, label: 'Overview' },
	{ href: (slug) => `/projects/${slug}/manage/basics`, label: 'Basics' },
	{ href: (slug) => `/projects/${slug}/manage/pitch`, label: 'Pitch' },
	{
		href: (slug) => `/projects/${slug}/manage/highlights`,
		label: 'Highlights',
	},
	{ href: (slug) => `/projects/${slug}/manage/members`, label: 'Members' },
	{
		href: (slug) => `/projects/${slug}/manage/settings`,
		label: 'Escrow & Settings',
	},
]

export function ManageNav({ slug }: { slug: string }) {
	const pathname = usePathname()

	return (
		<nav className="space-y-1">
			<h2 className="px-2 text-xs font-semibold tracking-wider uppercase text-muted-foreground">
				Manage Project
			</h2>
			<ul className="mt-2 space-y-1">
				{links.map(({ href, label }) => {
					const url = href(slug)
					const isActive = pathname === url
					return (
						<li key={label}>
							<Link
								href={url}
								className={cn(
									'flex gap-2 items-center px-3 py-2 text-sm rounded-md transition-colors',
									isActive
										? 'bg-primary text-primary-foreground'
										: 'hover:bg-accent hover:text-accent-foreground',
								)}
							>
								{label}
							</Link>
						</li>
					)
				})}
			</ul>
		</nav>
	)
}
