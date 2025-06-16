import {
	type ColumnFiltersState,
	type RowSelectionState,
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
import { useMemo, useState } from 'react'
import { useSetState } from 'react-use'
import { kycColumns } from '~/components/dashboard/table/kyc-table-columns'
import type { KycRecord } from '~/lib/types/dashboard'

type PaginationState = {
	pageIndex: number
	pageSize: number
}

export function useKycTable(initialData: KycRecord[] = []) {
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
				item.verification_level === verificationLevelFilter
			return statusMatch && levelMatch
		})
	}, [kycData, statusFilter, verificationLevelFilter])

	const table = useReactTable({
		data: filteredData,
		columns: kycColumns,
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
