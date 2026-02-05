'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
	IoCalendarOutline,
	IoMegaphoneOutline,
	IoOpenOutline,
	IoPencilOutline,
	IoPeopleOutline,
	IoSettingsOutline,
	IoSpeedometerOutline,
} from 'react-icons/io5'
import { Button } from '~/components/base/button'
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
	edit: IoPencilOutline,
	campaigns: IoMegaphoneOutline,
	milestones: IoCalendarOutline,
	members: IoPeopleOutline,
	settings: IoSettingsOutline,
}

type FoundationManageCommandCenterProps = {
	slug: string
	foundationName: string | null
}

/**
 * Command-center header + horizontal tabs for foundation manage.
 * Makes it clear you're in "manage & edit" mode and where to go.
 */
export function FoundationManageCommandCenter({
	slug,
	foundationName,
}: FoundationManageCommandCenterProps) {
	const pathname = usePathname()
	const basePath = `/foundations/${slug}/manage`

	return (
		<header className="sticky top-0 z-20 -mx-4 -mt-4 bg-background/95 px-4 py-4 shadow-[0_1px_0_0_hsl(var(--border))] backdrop-blur supports-[backdrop-filter]:bg-background/80 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
			{/* Title row: foundation name + Manage badge + View foundation */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex min-w-0 flex-wrap items-center gap-2">
					<Link
						href={`/foundations/${slug}`}
						className="text-lg font-semibold text-foreground hover:text-purple-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 rounded"
					>
						{foundationName ?? 'Foundation'}
					</Link>
					<span className="text-muted-foreground" aria-hidden="true">
						·
					</span>
					<span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
						Manage &amp; edit
					</span>
				</div>
				<Button
					asChild
					variant="outline"
					size="sm"
					className="shrink-0 w-full sm:w-auto focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
				>
					<Link href={`/foundations/${slug}`}>
						View foundation
						<IoOpenOutline className="ml-1.5 h-4 w-4" aria-hidden="true" />
					</Link>
				</Button>
			</div>

			{/* Horizontal tabs */}
			<nav
				className="mt-4 flex gap-0 border-b border-border"
				aria-label="Manage sections"
			>
				{FOUNDATION_MANAGE_SECTIONS.map((section) => {
					const url = section.href(slug)
					const isActive =
						section.path === ''
							? pathname === basePath
							: pathname.startsWith(basePath + section.path)
					const Icon = SECTION_ICONS[section.key]
					return (
						<Link
							key={section.key}
							href={url}
							className={cn(
								'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 rounded-t',
								isActive
									? 'border-purple-600 text-purple-700 bg-purple-50/50'
									: 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50',
							)}
							aria-current={isActive ? 'page' : undefined}
						>
							<Icon size={18} className="shrink-0" aria-hidden="true" />
							<span className="truncate">{section.title}</span>
						</Link>
					)
				})}
			</nav>
		</header>
	)
}
