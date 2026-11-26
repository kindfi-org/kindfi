'use client'

import { ArrowRight, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/base/card'
import type { AdminQueueSection } from '~/lib/queries/admin/get-action-queues'
import { QueueItemRow } from './queue-item-row'

interface QueueSectionProps {
	section: AdminQueueSection
	from: string
	onRetry: () => void
}

export function QueueSection({ section, from, onRetry }: QueueSectionProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
				<div>
					<CardTitle className="flex items-center gap-2 text-base">
						{section.title}
						{!section.error ? (
							<Badge variant="secondary" aria-label={`${section.total} items`}>
								{section.total}
							</Badge>
						) : null}
					</CardTitle>
					<p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
				</div>
				<Button asChild variant="ghost" size="sm" className="shrink-0">
					<Link href={section.viewAllHref}>
						View all
						<ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
					</Link>
				</Button>
			</CardHeader>
			<CardContent>
				{section.error ? (
					<div role="alert" className="flex items-center justify-between gap-3 py-2">
						<p className="text-sm text-muted-foreground">This queue could not be loaded.</p>
						<Button type="button" variant="outline" size="sm" onClick={onRetry}>
							<RotateCcw className="mr-1 h-4 w-4" aria-hidden="true" />
							Retry
						</Button>
					</div>
				) : section.items.length === 0 ? (
					<p className="py-2 text-sm text-muted-foreground">Nothing waiting here right now.</p>
				) : (
					<ul className="divide-y-0">
						{section.items.map((item) => (
							<QueueItemRow key={item.id} item={item} from={from} />
						))}
					</ul>
				)}
			</CardContent>
		</Card>
	)
}
