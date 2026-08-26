'use client'

import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { Card } from '~/components/base/card'
import { formatCurrency } from '~/components/sections/admin/admin-overview/formatters'
import { AdminStatusBadge } from '~/components/sections/admin/shared/admin-status-badge'
import { getProjectPrimaryAction } from '~/lib/admin/project-actions'
import type { AdminProjectListItem } from '~/lib/queries/admin/get-admin-projects'

interface ProjectRowCardProps {
	project: AdminProjectListItem
	/** Current admin URL (path + search) used as the back-link target. */
	from: string
}

function withFrom(href: string, from: string): string {
	if (!href.startsWith('/projects/')) return href
	const separator = href.includes('?') ? '&' : '?'
	return `${href}${separator}from=${encodeURIComponent(from)}`
}

export function ProjectRowCard({ project, from }: ProjectRowCardProps) {
	const primaryAction = getProjectPrimaryAction({
		status: project.status,
		slug: project.slug,
		hasEscrow: project.escrow !== null,
	})
	const fundingPercent =
		project.targetAmount > 0
			? Math.min(100, Math.round((project.currentAmount / project.targetAmount) * 100))
			: 0
	const creatorLabel = project.foundation?.name ?? project.creator?.displayName ?? null

	return (
		<Card className="overflow-hidden">
			<div className="flex flex-col sm:flex-row">
				<div className="relative h-36 w-full shrink-0 sm:h-auto sm:w-40 md:w-48">
					{project.imageUrl ? (
						<Image
							src={project.imageUrl}
							alt={`${project.title} cover image`}
							fill
							className="object-cover"
							sizes="(max-width: 640px) 100vw, 192px"
							loading="lazy"
						/>
					) : (
						<div
							aria-hidden="true"
							className="flex h-full min-h-24 w-full items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-200 text-2xl font-semibold text-emerald-700"
						>
							{project.title.slice(0, 1).toUpperCase()}
						</div>
					)}
				</div>

				<div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
					<div className="flex flex-wrap items-start justify-between gap-2">
						<div className="min-w-0">
							<div className="flex flex-wrap items-center gap-2">
								<h3 className="truncate font-semibold">{project.title}</h3>
								<AdminStatusBadge kind="project" status={project.status} />
								<AdminStatusBadge kind="escrow" status={project.escrow?.state ?? 'none'} />
								{project.developmentOnly ? (
									<Badge variant="outline" className="border-amber-300 text-amber-700">
										Development only
									</Badge>
								) : null}
							</div>
							<p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
								{creatorLabel ? <span className="truncate">{creatorLabel}</span> : null}
								{project.category ? (
									<>
										<span aria-hidden="true">·</span>
										<span>{project.category.name}</span>
									</>
								) : null}
								{project.location ? (
									<>
										<span aria-hidden="true">·</span>
										<span>{project.location}</span>
									</>
								) : null}
								{project.createdAt ? (
									<>
										<span aria-hidden="true">·</span>
										<span>
											Created{' '}
											<time dateTime={project.createdAt}>
												{formatDistanceToNow(new Date(project.createdAt))} ago
											</time>
										</span>
									</>
								) : null}
							</p>
						</div>

						<div className="flex shrink-0 items-center gap-2">
							{project.slug ? (
								<Button asChild variant="ghost" size="sm">
									<Link href={`/projects/${project.slug}`}>View public page</Link>
								</Button>
							) : null}
							<Button asChild variant="outline" size="sm">
								<Link href={withFrom(primaryAction.href, from)}>{primaryAction.label}</Link>
							</Button>
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
						<div className="min-w-40 flex-1">
							<div className="flex justify-between text-xs text-muted-foreground">
								<span>
									{formatCurrency(project.currentAmount)} of {formatCurrency(project.targetAmount)}
								</span>
								<span>{fundingPercent}%</span>
							</div>
							<div
								role="progressbar"
								aria-valuenow={fundingPercent}
								aria-valuemin={0}
								aria-valuemax={100}
								aria-label={`Funding progress ${fundingPercent}%`}
								className="mt-1 h-2 overflow-hidden rounded-full bg-muted"
							>
								<div
									className="h-full rounded-full bg-emerald-500"
									style={{ width: `${fundingPercent}%` }}
								/>
							</div>
						</div>
						<p className="shrink-0 text-muted-foreground">
							{project.kinderCount.toLocaleString('en-US')}{' '}
							{project.kinderCount === 1 ? 'supporter' : 'supporters'}
						</p>
					</div>
				</div>
			</div>
		</Card>
	)
}
