import {
	type ColumnFiltersState,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type RowSelectionState,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { useSetState } from 'react-use'
import { createKycTableColumns } from '~/components/dashboard/table/kyc-table-columns'
import type { KycRecord } from '~/lib/types/dashboard'

type PaginationState = {
	pageIndex: number
	pageSize: number
}

interface UseKycTableOptions {
	onStatusUpdate?: () => void
	onReview?: (userId: string) => void
}

export function useKycTable(
	initialData: KycRecord[] = [],
	options: UseKycTableOptions = {},
) {
	const { onStatusUpdate, onReview } = options
	const [kycData, setKycData] = useState<KycRecord[]>(initialData)

	const [statusFilter, setStatusFilter] = useState('all')
	const [verificationLevelFilter, setVerificationLevelFilter] = useState('all')

	const [rowSelection, setRowSelection] = useSetState<RowSelectionState>({})
	const [columnVisibility, setColumnVisibility] = useSetState<VisibilityState>(
		{},
	)
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [sorting, setSorting] = useState<SortingState>([])

	const [pagination, setPagination] = useSetState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	})

	const filteredData = useMemo(() => {
		return kycData.filter((item) => {
			const statusMatch = statusFilter === 'all' || item.status === statusFilter
			const levelMatch =
				verificationLevelFilter === 'all' ||
				item.verificationLevel === verificationLevelFilter
			return statusMatch && levelMatch
		})
	}, [kycData, statusFilter, verificationLevelFilter])

	const columns = useMemo(
		() => createKycTableColumns(onStatusUpdate, onReview),
		[onStatusUpdate, onReview],
	)

	const table = useReactTable({
		data: filteredData,
		columns,
		state: {
			pagination,
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
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

	return {
		table,
		kycData,
		setKycData,
		filters: {
			statusFilter,
			verificationLevelFilter,
		},
		setFilters: {
			setStatusFilter,
			setVerificationLevelFilter,
		},
	}
}
