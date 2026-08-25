'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useRef } from 'react'
import { Button } from '~/components/base/button'
import { AdminSectionHeader } from '~/components/sections/admin/admin-section-header'
import { AdminListShell } from '~/components/sections/admin/shared/admin-list-shell'
import { useAdminListParams } from '~/hooks/admin/use-admin-list-params'
import { useAdminQuery } from '~/hooks/admin/use-admin-query'
import type {
	AdminProjectFilterOptions,
	AdminProjectListItem,
} from '~/lib/queries/admin/get-admin-projects'
import type { AdminListResponse } from '~/lib/validators/admin-list-params'
import { adminProjectsQuerySchema } from '~/lib/validators/admin-list-params'
import { ProjectFilters } from './project-filters'
import { ProjectRowCard } from './project-row-card'

type ProjectsResponse = AdminListResponse<AdminProjectListItem> & {
	filterOptions?: AdminProjectFilterOptions
}

export function AdminProjectsPage() {
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const from = searchParams.size > 0 ? `${pathname}?${searchParams.toString()}` : pathname

	const { params, normalizedParams, setParam, setPage, resetFilters } =
		useAdminListParams(adminProjectsQuerySchema)

	const { data, isLoading, isError, refetch } = useAdminQuery<ProjectsResponse>('projects', {
		params: normalizedParams,
	})

	// filterOptions only ship with page 1; keep the last seen set.
	const filterOptionsRef = useRef<AdminProjectFilterOptions | null>(null)
	if (data?.filterOptions) {
		filterOptionsRef.current = data.filterOptions
	}

	const hasActiveFilters = Object.keys(normalizedParams).some(
		(key) => !['page', 'pageSize', 'sort'].includes(key),
	)

	return (
		<div className="space-y-6">
			<AdminSectionHeader
				title="Projects"
				description="Search, review, and manage every campaign. Filters are stored in the URL so views can be bookmarked and shared."
			>
				<Button asChild variant="outline">
					<Link href="/admin/projects/create">Create dev project</Link>
				</Button>
			</AdminSectionHeader>

			<AdminListShell
				searchValue={params.q ?? ''}
				onSearchChange={(value) => setParam('q', value || undefined)}
				searchPlaceholder="Search by title, slug, creator, foundation, or ID…"
				filters={
					<ProjectFilters
						values={{
							status: params.status,
							escrow: params.escrow,
							category: params.category,
							foundation: params.foundation,
							devOnly: params.devOnly,
							sort: params.sort,
						}}
						options={filterOptionsRef.current}
						onChange={setParam}
					/>
				}
				isLoading={isLoading}
				isError={isError}
				onRetry={() => refetch()}
				total={data?.total ?? 0}
				page={params.page}
				pageSize={params.pageSize}
				onPageChange={setPage}
				emptyTitle="No projects yet"
				emptyDescription="Projects appear here as soon as creators start campaigns."
				hasActiveFilters={hasActiveFilters}
				onResetFilters={resetFilters}
				skeletonRowHeight={148}
			>
				<ul className="space-y-3">
					{(data?.items ?? []).map((project) => (
						<li key={project.id}>
							<ProjectRowCard project={project} from={from} />
						</li>
					))}
				</ul>
			</AdminListShell>
		</div>
	)
}
