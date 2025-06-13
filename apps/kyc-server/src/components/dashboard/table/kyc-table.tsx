'use client'

import {
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	MouseSensor,
	TouchSensor,
	type UniqueIdentifier,
	closestCenter,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { arrayMove } from '@dnd-kit/sortable'
import {
	type ColumnFiltersState,
	type SortingState,
	type VisibilityState,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table'
import { useCallback, useEffect, useId, useMemo, useState } from 'react'

import { Table } from '~/components/base/table'
import { KycTableSkeleton } from '~/components/dashboard/skeletons/kyc-table-skeleton'
import { KycTableBody } from '~/components/dashboard/table/kyc-table-body'
import { kycColumns } from '~/components/dashboard/table/kyc-table-columns'
import { KycTableFilters } from '~/components/dashboard/table/kyc-table-filters'
import { KycTableHeader } from '~/components/dashboard/table/kyc-table-header'
import { KycTablePagination } from '~/components/dashboard/table/kyc-table-pagination'
import type { KycRecord } from '~/lib/types/dashboard'

interface KycTableProps {
	data?: KycRecord[]
	isLoading?: boolean
}

export function KycTable({
	data: initialData,
	isLoading = false,
}: KycTableProps) {
	const [data, setData] = useState(() => initialData || [])
	const [rowSelection, setRowSelection] = useState({})
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [sorting, setSorting] = useState<SortingState>([])
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: 10,
	})
	const [statusFilter, setStatusFilter] = useState<string>('all')
	const [verificationLevelFilter, setVerificationLevelFilter] =
		useState<string>('all')

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

	// Update data when initialData changes
	useEffect(() => {
		if (initialData) {
			setData(initialData)
		}
	}, [initialData])

	// Filter data based on status and verification level
	const filteredData = useMemo(() => {
		return data.filter((item) => {
			const statusMatch = statusFilter === 'all' || item.status === statusFilter
			const levelMatch =
				verificationLevelFilter === 'all' ||
				item.verification_level === verificationLevelFilter
			return statusMatch && levelMatch
		})
	}, [data, statusFilter, verificationLevelFilter])

	const table = useReactTable({
		data: filteredData,
		columns: kycColumns,
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
			pagination,
		},
		getRowId: (row) => row.id.toString(),
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	})

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event
			if (active && over && active.id !== over.id) {
				setData((data) => {
					const oldIndex = dataIds.indexOf(active.id)
					const newIndex = dataIds.indexOf(over.id)
					return arrayMove(data, oldIndex, newIndex)
				})
			}
		},
		[dataIds],
	)

	if (isLoading || !initialData) {
		return <KycTableSkeleton />
	}

	return (
		<div
			className="flex w-full flex-col justify-start gap-6"
			aria-label="KYC Records Table"
		>
			<KycTableFilters
				statusFilter={statusFilter}
				verificationLevelFilter={verificationLevelFilter}
				onStatusFilterChange={setStatusFilter}
				onVerificationLevelFilterChange={setVerificationLevelFilter}
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
							<KycTableHeader headerGroups={table.getHeaderGroups()} />
							<KycTableBody
								table={table}
								dataIds={dataIds}
								columnsLength={kycColumns.length}
							/>
						</Table>
					</DndContext>
				</div>

				<KycTablePagination table={table} />
			</div>
		</div>
	)
}
