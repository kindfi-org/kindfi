'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
	IoCreateOutline,
	IoMegaphoneOutline,
	IoPeopleOutline,
	IoSettingsOutline,
	IoSpeedometerOutline,
	IoStarOutline,
} from 'react-icons/io5'
import { cn } from '~/lib/utils'

const links: {
	href: (slug: string) => string
	label: string
	Icon: React.ComponentType<{ size?: number; className?: string }>
}[] = [
	{
		href: (slug) => `/projects/${slug}/manage`,
		label: 'Overview',
		Icon: IoSpeedometerOutline,
	},
	{
		href: (slug) => `/projects/${slug}/manage/basics`,
		label: 'Basics',
		Icon: IoCreateOutline,
	},
	{
		href: (slug) => `/projects/${slug}/manage/pitch`,
		label: 'Pitch',
		Icon: IoMegaphoneOutline,
	},
	{
		href: (slug) => `/projects/${slug}/manage/highlights`,
		label: 'Highlights',
		Icon: IoStarOutline,
	},
	{
		href: (slug) => `/projects/${slug}/manage/members`,
		label: 'Members',
		Icon: IoPeopleOutline,
	},
	{
		href: (slug) => `/projects/${slug}/manage/settings`,
		label: 'Escrow & Settings',
		Icon: IoSettingsOutline,
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
				{links.map(({ href, label, Icon }) => {
					const url = href(slug)
					const isActive = pathname === url
					return (
						<li key={label}>
							<Link
								href={url}
								className={cn(
									'group flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
									isActive
										? 'bg-primary text-primary-foreground'
										: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
								)}
							>
								<Icon
									className={cn(
										'shrink-0',
										isActive
											? 'opacity-100'
											: 'opacity-80 group-hover:opacity-100',
									)}
									size={16}
								/>
								<span className="truncate">{label}</span>
							</Link>
						</li>
					)
				})}
			</ul>
		</nav>
	)
}
