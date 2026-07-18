'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import {
	IoCreateOutline,
	IoFlagOutline,
	IoLockClosedOutline,
	IoMegaphoneOutline,
	IoNewspaperOutline,
	IoOpenOutline,
	IoPeopleOutline,
	IoSettingsOutline,
	IoSpeedometerOutline,
	IoStarOutline,
} from 'react-icons/io5'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { PROJECT_STATUS_COLORS, PROJECT_STATUS_LABELS } from '~/lib/projects/project-status'
import type { ProjectManageMeta } from '~/lib/queries/projects/get-project-manage-meta'
import { cn } from '~/lib/utils'
import {
	getProjectManageNavSections,
	isProjectManageNavActive,
	type ProjectManageSectionKey,
} from './constants'

const SECTION_ICONS: Record<
	ProjectManageSectionKey,
	React.ComponentType<{ size?: number; className?: string }>
> = {
	overview: IoSpeedometerOutline,
	basics: IoCreateOutline,
	pitch: IoMegaphoneOutline,
	highlights: IoStarOutline,
	updates: IoNewspaperOutline,
	members: IoPeopleOutline,
	milestones: IoFlagOutline,
	'escrow-setup': IoSettingsOutline,
	'escrow-manage': IoLockClosedOutline,
}

type ProjectManageCommandCenterProps = {
	slug: string
	project: Pick<
		ProjectManageMeta,
		'title' | 'imageUrl' | 'categoryName' | 'hasEscrow' | 'foundation' | 'status'
	>
	isPlatformAdmin: boolean
}

/**
 * Sticky command-center header with project identity and horizontal section tabs.
 */
export function ProjectManageCommandCenter({
	slug,
	project,
	isPlatformAdmin,
}: ProjectManageCommandCenterProps) {
	const pathname = usePathname()
	const basePath = `/projects/${slug}/manage`
	const navSections = useMemo(
		() => getProjectManageNavSections(isPlatformAdmin, project.hasEscrow),
		[isPlatformAdmin, project.hasEscrow],
	)

	return (
		<header className="sticky top-0 z-20 -mx-4 bg-background/95 px-4 py-4 shadow-[0_1px_0_0_hsl(var(--border))] backdrop-blur supports-[backdrop-filter]:bg-background/80 md:-mx-6 md:px-6">
			<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
				<div className="flex min-w-0 items-start gap-3">
					<div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
						{project.imageUrl ? (
							<Image src={project.imageUrl} alt="" fill className="object-cover" sizes="48px" />
						) : (
							<div className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
								{project.title.slice(0, 2).toUpperCase()}
							</div>
						)}
					</div>

					<div className="min-w-0 space-y-1.5">
						<div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
							<Link
								href={`/projects/${slug}`}
								className="truncate text-lg font-semibold text-foreground hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded"
							>
								{project.title}
							</Link>
							<span className="text-muted-foreground" aria-hidden="true">
								·
							</span>
							<span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
								Manage &amp; edit
							</span>
						</div>

						<div className="flex flex-wrap items-center gap-2">
							{project.categoryName ? (
								<Badge variant="secondary" className="text-xs font-medium">
									{project.categoryName}
								</Badge>
							) : null}
							{project.foundation ? (
								<Link
									href={`/foundations/${project.foundation.slug}`}
									className="inline-flex items-center rounded-md border border-border px-2.5 py-0.5 text-xs font-medium text-foreground hover:bg-muted/50"
								>
									{project.foundation.name}
								</Link>
							) : null}
							<Badge
								variant="outline"
								className={cn('text-xs font-medium', PROJECT_STATUS_COLORS[project.status])}
							>
								{PROJECT_STATUS_LABELS[project.status]}
							</Badge>
							{isPlatformAdmin ? (
								<Badge
									variant="outline"
									className={cn(
										'text-xs font-medium',
										project.hasEscrow
											? 'border-emerald-200 text-emerald-700 dark:border-emerald-900 dark:text-emerald-400'
											: 'border-amber-200 text-amber-700 dark:border-amber-900 dark:text-amber-400',
									)}
								>
									{project.hasEscrow ? 'Escrow active' : 'Escrow not set up'}
								</Badge>
							) : null}
						</div>
					</div>
				</div>

				<Button
					asChild
					variant="outline"
					size="sm"
					className="shrink-0 w-full sm:w-auto focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
				>
					<Link href={`/projects/${slug}`}>
						View public page
						<IoOpenOutline className="ml-1.5 h-4 w-4" aria-hidden="true" />
					</Link>
				</Button>
			</div>

			<nav
				className="mt-4 -mx-4 overflow-x-auto px-4 scrollbar-thin"
				aria-label="Project manage sections"
			>
				<div className="flex min-w-max gap-0 border-b border-border">
					{navSections.map((section) => {
						const url = section.href(slug)
						const isActive = isProjectManageNavActive(pathname, basePath, section)
						const Icon = SECTION_ICONS[section.key]

						return (
							<Link
								key={section.key}
								href={url}
								className={cn(
									'flex items-center gap-2 whitespace-nowrap px-3 py-3 text-sm font-medium border-b-2 -mb-px transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-t sm:px-4',
									isActive
										? 'border-blue-600 text-blue-700 bg-blue-50/50 dark:text-blue-400 dark:bg-blue-950/30'
										: 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50',
								)}
								aria-current={isActive ? 'page' : undefined}
							>
								<Icon size={16} className="shrink-0" aria-hidden="true" />
								<span>{section.title}</span>
							</Link>
						)
					})}
				</div>
			</nav>
		</header>
	)
}
