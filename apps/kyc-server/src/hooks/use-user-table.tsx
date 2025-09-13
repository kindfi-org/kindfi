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
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSetState } from 'react-use'
import { createUserTableColumns } from '~/components/dashboard/table/user-table-columns'
import { useKYCWebSocket } from '~/hooks/use-kyc-ws'

type PaginationState = {
	pageIndex: number
	pageSize: number
}

export function useUserTable() {
	const [userData, setUserData] = useState([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(null)
	
	const [searchFilter, setSearchFilter] = useState('')
	const [statusFilter, setStatusFilter] = useState('all')
	const [verificationLevelFilter, setVerificationLevelFilter] = useState('all')

	const [rowSelection, setRowSelection] = useSetState<RowSelectionState>({})
	const [columnVisibility, setColumnVisibility] = useSetState<VisibilityState>({})
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [sorting, setSorting] = useState<SortingState>([])

	const [pagination, setPagination] = useSetState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	})

	const fetchUsers = useCallback(async () => {
		try {
			setIsLoading(true)
			setError(null)
			
			const response = await fetch('/api/users?limit=100') // Get more data for pagination
			const result = await response.json()
			
			if (!response.ok) {
				throw new Error(result.error || 'Failed to fetch users')
			}
			
			if (result.success) {
				setUserData(result.data || [])
			} else {
				throw new Error('Invalid response')
			}
		} catch (err) {
			console.log('Fetch error:', err)
			setError(err.message || 'Something went wrong')
		} finally {
			setIsLoading(false)
		}
	}, [])

	const filteredData = useMemo(() => {
		return userData.filter((item) => {
			const searchMatch = !searchFilter || 
				item.email?.toLowerCase().includes(searchFilter.toLowerCase()) ||
				item.display_name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
				item.user_id.toLowerCase().includes(searchFilter.toLowerCase())
			const statusMatch = statusFilter === 'all' || item.status === statusFilter
			const levelMatch = verificationLevelFilter === 'all' || item.verification_level === verificationLevelFilter
			return searchMatch && statusMatch && levelMatch
		})
	}, [userData, searchFilter, statusFilter, verificationLevelFilter])

	const sortedData = useMemo(() => {
		return [...filteredData].sort((a, b) => {
			if (a.status === 'pending' && b.status !== 'pending') return -1
			if (b.status === 'pending' && a.status !== 'pending') return 1
			return 0
		})
	}, [filteredData])

	const columns = useMemo(() => 
		createUserTableColumns(() => fetchUsers()), 
		[fetchUsers]
	)

	const table = useReactTable({
		data: sortedData,
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

	useEffect(() => {
		fetchUsers()
	}, [fetchUsers])

	const { isConnected } = useKYCWebSocket({
		onUpdate: () => fetchUsers()
	})

	useEffect(() => {
		if (!isConnected) {
			const interval = setInterval(fetchUsers, 30000)
			return () => clearInterval(interval)
		}
	}, [isConnected, fetchUsers])

	return {
		table,
		data: sortedData,
		isLoading,
		error,
		filters: {
			search: searchFilter,
			status: statusFilter,
			verificationLevel: verificationLevelFilter,
		},
		setFilters: {
			setSearchFilter,
			setStatusFilter,
			setVerificationLevelFilter,
		},
		actions: {
			refetch: fetchUsers,
		},
	}
}