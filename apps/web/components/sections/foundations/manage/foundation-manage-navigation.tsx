'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
	IoCalendarOutline,
	IoCreateOutline,
	IoMegaphoneOutline,
	IoPeopleOutline,
	IoSettingsOutline,
	IoSpeedometerOutline,
} from 'react-icons/io5'
import { cn } from '~/lib/utils'
import {
	FOUNDATION_MANAGE_SECTIONS,
	type FoundationManageSectionKey,
} from './constants'

const SECTION_ICONS: Record<
	FoundationManageSectionKey,
	React.ComponentType<{ size?: number; className?: string }>
> = {
	overview: IoSpeedometerOutline,
	edit: IoCreateOutline,
	campaigns: IoMegaphoneOutline,
	milestones: IoCalendarOutline,
	members: IoPeopleOutline,
	settings: IoSettingsOutline,
}

export function FoundationManageNavigation({ slug }: { slug: string }) {
	const pathname = usePathname()
	const basePath = `/foundations/${slug}/manage`

	return (
		<nav className="mb-8" aria-label="Foundation management navigation">
			<h2 className="px-2 text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-3">
				Manage Foundation
			</h2>
			<ul className="space-y-1">
				{FOUNDATION_MANAGE_SECTIONS.map((section) => {
					const url = section.href(slug)
					const isActive =
						section.path === ''
							? pathname === basePath
							: pathname.startsWith(basePath + section.path)
					const Icon = SECTION_ICONS[section.key]
					return (
						<li key={section.key}>
							<Link
								href={url}
								className={cn(
									'group flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2',
									isActive
										? 'bg-purple-100 text-purple-700 font-semibold shadow-sm'
										: 'text-muted-foreground hover:bg-purple-50 hover:text-purple-600',
								)}
								aria-current={isActive ? 'page' : undefined}
							>
								<Icon
									className={cn(
										'shrink-0 transition-opacity',
										isActive
											? 'opacity-100'
											: 'opacity-70 group-hover:opacity-100',
									)}
									size={18}
									aria-hidden="true"
								/>
								<span className="truncate">{section.title}</span>
							</Link>
						</li>
					)
				})}
			</ul>
		</nav>
	)
}
