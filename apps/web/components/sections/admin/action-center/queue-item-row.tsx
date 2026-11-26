'use client'

import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { Button } from '~/components/base/button'
import {
	AdminStatusBadge,
	type AdminStatusKind,
} from '~/components/sections/admin/shared/admin-status-badge'
import type { AdminQueueItem } from '~/lib/queries/admin/get-action-queues'

/** Appends a `from` back-link param to hrefs that leave the admin area. */
export function withFromParam(href: string, from: string): string {
	if (!href.startsWith('/projects/')) return href
	const separator = href.includes('?') ? '&' : '?'
	return `${href}${separator}from=${encodeURIComponent(from)}`
}

interface QueueItemRowProps {
	item: AdminQueueItem
	/** Current admin URL (path + search) used as the back-link target. */
	from: string
}

export function QueueItemRow({ item, from }: QueueItemRowProps) {
	return (
		<li className="flex flex-col gap-2 border-t py-3 first:border-t-0 sm:flex-row sm:items-center sm:justify-between">
			<div className="min-w-0 space-y-1">
				<div className="flex flex-wrap items-center gap-2">
					<AdminStatusBadge kind="priority" status={item.priority} />
					<AdminStatusBadge kind={item.statusKind as AdminStatusKind} status={item.status} />
				</div>
				<p className="truncate font-medium">{item.title}</p>
				<p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
					{item.subtitle ? <span className="truncate">{item.subtitle}</span> : null}
					{item.waitingSince ? (
						<>
							<span aria-hidden="true">·</span>
							<span>
								Waiting{' '}
								<time dateTime={item.waitingSince}>
									{formatDistanceToNow(new Date(item.waitingSince))}
								</time>
							</span>
						</>
					) : null}
				</p>
			</div>
			<div className="flex shrink-0 items-center gap-2">
				{item.viewHref ? (
					<Button asChild variant="ghost" size="sm">
						<Link href={withFromParam(item.viewHref, from)}>View</Link>
					</Button>
				) : null}
				<Button asChild variant="outline" size="sm">
					<Link href={withFromParam(item.primaryAction.href, from)}>
						{item.primaryAction.label}
					</Link>
				</Button>
			</div>
		</li>
	)
}
