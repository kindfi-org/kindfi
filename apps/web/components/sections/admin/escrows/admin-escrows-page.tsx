'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useId } from 'react'
import { Label } from '~/components/base/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'
import { AdminSectionHeader } from '~/components/sections/admin/admin-section-header'
import { AdminListShell } from '~/components/sections/admin/shared/admin-list-shell'
import { useAdminListParams } from '~/hooks/admin/use-admin-list-params'
import { useAdminQuery } from '~/hooks/admin/use-admin-query'
import type { AdminEscrowListItem } from '~/lib/queries/admin/get-admin-escrows'
import type { AdminListResponse } from '~/lib/validators/admin-list-params'
import {
	adminEscrowsQuerySchema,
	ESCROW_SORT_OPTIONS,
	ESCROW_STATE_FILTERS,
} from '~/lib/validators/admin-list-params'
import { EscrowRow } from './escrow-row'

const ALL = 'all'

const SORT_LABELS: Record<(typeof ESCROW_SORT_OPTIONS)[number], string> = {
	newest: 'Newest first',
	oldest: 'Oldest first',
	updated: 'Recently updated',
	amount: 'Highest amount',
}

export function AdminEscrowsPage() {
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const from = searchParams.size > 0 ? `${pathname}?${searchParams.toString()}` : pathname
	const stateSelectId = useId()
	const sortSelectId = useId()

	const { params, normalizedParams, setParam, setPage, resetFilters } =
		useAdminListParams(adminEscrowsQuerySchema)

	const { data, isLoading, isError, refetch } = useAdminQuery<
		AdminListResponse<AdminEscrowListItem>
	>('escrows', { params: normalizedParams })

	const hasActiveFilters = Object.keys(normalizedParams).some(
		(key) => !['page', 'pageSize', 'sort'].includes(key),
	)

	return (
		<div className="space-y-6">
			<AdminSectionHeader
				title="Escrows"
				description="Every escrow shown with its campaign. Broken associations are flagged; on-chain detail loads when a row is expanded."
			/>

			<AdminListShell
				searchValue={params.q ?? ''}
				onSearchChange={(value) => setParam('q', value || undefined)}
				searchPlaceholder="Search by project, contract address, or engagement ID…"
				filters={
					<>
						<div className="flex items-center gap-1.5">
							<Label htmlFor={stateSelectId} className="sr-only">
								Filter by escrow state
							</Label>
							<Select
								value={params.state ?? ALL}
								onValueChange={(next) => setParam('state', next === ALL ? undefined : next)}
							>
								<SelectTrigger
									id={stateSelectId}
									className="h-9 w-auto min-w-32 gap-1"
									aria-label="Filter by escrow state"
								>
									<SelectValue placeholder="All states" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={ALL}>All states</SelectItem>
									{ESCROW_STATE_FILTERS.map((state) => (
										<SelectItem key={state} value={state}>
											{state}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex items-center gap-1.5">
							<Label htmlFor={sortSelectId} className="sr-only">
								Sort escrows
							</Label>
							<Select
								value={params.sort}
								onValueChange={(next) => setParam('sort', next === 'newest' ? undefined : next)}
							>
								<SelectTrigger
									id={sortSelectId}
									className="h-9 w-auto min-w-32 gap-1"
									aria-label="Sort escrows"
								>
									<SelectValue placeholder="Newest first" />
								</SelectTrigger>
								<SelectContent>
									{ESCROW_SORT_OPTIONS.map((sort) => (
										<SelectItem key={sort} value={sort}>
											{SORT_LABELS[sort]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</>
				}
				isLoading={isLoading}
				isError={isError}
				onRetry={() => refetch()}
				total={data?.total ?? 0}
				page={params.page}
				pageSize={params.pageSize}
				onPageChange={setPage}
				emptyTitle="No escrows yet"
				emptyDescription="Escrow contracts appear here once campaigns deploy them."
				hasActiveFilters={hasActiveFilters}
				onResetFilters={resetFilters}
				skeletonRowHeight={128}
			>
				<ul className="space-y-3">
					{(data?.items ?? []).map((escrow) => (
						<li key={escrow.id}>
							<EscrowRow escrow={escrow} from={from} onSynced={() => refetch()} />
						</li>
					))}
				</ul>
			</AdminListShell>
		</div>
	)
}
