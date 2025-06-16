import {
	type ColumnFiltersState,
	type OnChangeFn,
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

type SetPaginationDispatch = React.Dispatch<
	React.SetStateAction<Partial<PaginationState>>
>

export function useKycTable(initialData: KycRecord[] = []) {
	const [kycData, setKycData] = useState<KycRecord[]>(initialData)

	const [statusFilter, setStatusFilter] = useState('all')
	const [verificationLevelFilter, setVerificationLevelFilter] = useState('all')

	const [rowSelection, setRowSelection] = useSetState({})
	const [columnVisibility, setColumnVisibility] = useSetState<VisibilityState>(
		{},
	)
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [sorting, setSorting] = useState<SortingState>([])

	const [pagination, setPagination] = useSetState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	})

	const updatePagination = (({
		pageIndex,
		pageSize,
	}: Partial<PaginationState>) => {
		setPagination((prev) => ({
			pageIndex: pageIndex ?? prev.pageIndex,
			pageSize: pageSize ?? prev.pageSize,
		}))
	}) as SetPaginationDispatch

	const handlePaginationChange: OnChangeFn<PaginationState> = (
		updaterOrValue,
	) => {
		if (typeof updaterOrValue === 'function') {
			const result = updaterOrValue(pagination)
			updatePagination(result)
		} else {
			updatePagination(updaterOrValue)
		}
	}

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
		onPaginationChange: handlePaginationChange,
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
