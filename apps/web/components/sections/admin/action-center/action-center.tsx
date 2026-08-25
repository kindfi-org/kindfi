'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { Button } from '~/components/base/button'
import { Skeleton } from '~/components/base/skeleton'
import { AdminSectionHeader } from '~/components/sections/admin/admin-section-header'
import { useAdminQuery } from '~/hooks/admin/use-admin-query'
import type { AdminQueueSection } from '~/lib/queries/admin/get-action-queues'
import type { AdminDashboardStats } from '~/lib/validators/admin-dashboard-stats'
import { MetricGrid } from './metric-grid'
import { QueueSection } from './queue-section'

export interface ActionQueuePayload {
	queues: AdminQueueSection[]
	stats: AdminDashboardStats | null
	statsError: boolean
}

const SKELETON_KEYS = ['a', 'b', 'c', 'd']

/**
 * The admin action center: work requiring attention first, platform metrics
 * (linking to pre-filtered management views) below.
 */
export function AdminActionCenter() {
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const from = searchParams.size > 0 ? `${pathname}?${searchParams.toString()}` : pathname

	const { data, isLoading, isError, refetch } = useAdminQuery<ActionQueuePayload>('action-queue')

	const queues = data?.queues ?? []
	const activeQueues = queues.filter((queue) => queue.error || queue.total > 0)
	const allClear = !isLoading && !isError && activeQueues.length === 0

	return (
		<div className="space-y-8">
			<AdminSectionHeader
				title="Operations"
				description="Work requiring admin attention, with platform metrics below."
			/>

			<section aria-label="Action queue" className="space-y-4">
				{isLoading ? (
					<output aria-label="Loading action queue" className="block space-y-4">
						{SKELETON_KEYS.map((key) => (
							<Skeleton key={key} className="h-40 w-full rounded-xl" />
						))}
					</output>
				) : isError ? (
					<div
						role="alert"
						className="flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center"
					>
						<p className="font-medium">The action queue could not be loaded.</p>
						<Button type="button" variant="outline" onClick={() => refetch()}>
							Retry
						</Button>
					</div>
				) : allClear ? (
					<div className="rounded-lg border border-dashed p-8 text-center">
						<p className="font-medium">All clear</p>
						<p className="mt-1 text-sm text-muted-foreground">
							No projects, escrows, reviews, or KYC cases are waiting on an admin right now.
						</p>
					</div>
				) : (
					<div className="grid gap-4 xl:grid-cols-2">
						{activeQueues.map((section) => (
							<QueueSection
								key={section.key}
								section={section}
								from={from}
								onRetry={() => refetch()}
							/>
						))}
					</div>
				)}
			</section>

			<section aria-label="Platform metrics" className="space-y-4">
				<h2 className="text-lg font-semibold">Platform metrics</h2>
				{data?.stats ? (
					<MetricGrid stats={data.stats} />
				) : data?.statsError ? (
					<div role="alert" className="flex items-center justify-between rounded-lg border p-4">
						<p className="text-sm text-muted-foreground">Metrics could not be loaded.</p>
						<Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
							Retry
						</Button>
					</div>
				) : isLoading ? (
					<Skeleton className="h-64 w-full rounded-xl" />
				) : null}
			</section>
		</div>
	)
}
