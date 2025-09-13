/** biome-ignore-all lint/a11y/useAriaPropsSupportedByRole: any*/
'use client'

import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	MouseSensor,
	TouchSensor,
	type UniqueIdentifier,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { arrayMove } from '@dnd-kit/sortable'
import { useCallback, useId, useMemo } from 'react'

import { Table } from '~/components/base/table'
import { UserTableSkeleton } from '~/components/dashboard/skeletons/user-table-skeleton'
import { UserTableBody } from '~/components/dashboard/table/user-table-body'
import { userTableColumns } from '~/components/dashboard/table/user-table-columns'
import { UserTableFilters } from '~/components/dashboard/table/user-table-filters'
import { UserTableHeader } from '~/components/dashboard/table/user-table-header'
import { UserTablePagination } from '~/components/dashboard/table/user-table-pagination'
import { useUserTable } from '~/hooks/use-user-table'

export function UserTable() {
	const { table, data, isLoading, error, filters, setFilters, actions } =
		useUserTable()

	const sortableId = useId()
	const sensors = useSensors(
		useSensor(MouseSensor, {}),
		useSensor(TouchSensor, {}),
		useSensor(KeyboardSensor, {}),
	)

	const dataIds = useMemo<UniqueIdentifier[]>(
		() => data?.map(({ id }) => id) || [],
		[data],
	)

	const handleDragEnd = useCallback((event: DragEndEvent) => {
		const { active, over } = event
		if (active && over && active.id !== over.id) {
			console.log('Reordering rows:', { from: active.id, to: over.id })
		}
	}, [])

	if (error) {
		return (
			<div className="flex w-full flex-col justify-start gap-6">
				<div className="flex items-center justify-center h-64 px-4 lg:px-6 rounded-lg border border-red-200 bg-red-50">
					<div className="text-center space-y-4">
						<p className="text-red-600 font-medium">Failed to load users</p>
						<p className="text-red-500 text-sm">{error}</p>
						<button
							onClick={actions.refetch}
							className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
						>
							Try Again
						</button>
					</div>
				</div>
			</div>
		)
	}

	if (isLoading) {
		return <UserTableSkeleton />
	}

	return (
		<div
			className="flex w-full flex-col justify-start gap-6"
			aria-label="Users Table with KYC Information"
		>
			<UserTableFilters
				search={filters.search}
				statusFilter={filters.status}
				verificationLevelFilter={filters.verificationLevel}
				onSearchChange={setFilters.setSearchFilter}
				onStatusFilterChange={setFilters.setStatusFilter}
				onVerificationLevelFilterChange={setFilters.setVerificationLevelFilter}
				table={table}
			/>

			<div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
				<div className="overflow-hidden rounded-lg border">
					<DndContext
						collisionDetection={closestCenter}
						modifiers={[restrictToVerticalAxis]}
						onDragEnd={handleDragEnd}
						sensors={sensors}
						id={sortableId}
					>
						<Table>
							<UserTableHeader headerGroups={table.getHeaderGroups()} />
							<UserTableBody
								table={table}
								dataIds={dataIds}
								columnsLength={userTableColumns.length}
							/>
						</Table>
					</DndContext>
				</div>

				<UserTablePagination table={table} />
			</div>
		</div>
	)
}
