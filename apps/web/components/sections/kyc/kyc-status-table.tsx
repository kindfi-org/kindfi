'use client'

import {
	type ColumnDef,
	type ColumnFiltersState,
	type SortingState,
	type VisibilityState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react'
import * as React from 'react'

import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { Checkbox } from '~/components/base/checkbox'
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '~/components/base/dropdown-menu'
import { Input } from '~/components/base/input'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/base/table'

export type KycStatusRow = {
	id: string
	user: string
	status: 'approved' | 'pending' | 'rejected'
	requestedAt: string
}

const kycData: KycStatusRow[] = [
	{ id: '1', user: 'alice', status: 'approved', requestedAt: '2025-05-20' },
	{ id: '2', user: 'bob', status: 'pending', requestedAt: '2025-05-28' },
	{ id: '3', user: 'charlie', status: 'rejected', requestedAt: '2025-05-15' },
	{ id: '4', user: 'diana', status: 'approved', requestedAt: '2025-05-25' },
	{ id: '5', user: 'eve', status: 'pending', requestedAt: '2025-05-30' },
]

export const columns: ColumnDef<KycStatusRow>[] = [
	{
		id: 'select',
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && 'indeterminate')
				}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: 'user',
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					User
					<ArrowUpDown />
				</Button>
			)
		},
		cell: ({ row }) => (
			<div className="font-medium">{row.getValue('user')}</div>
		),
	},
	{
		accessorKey: 'status',
		header: 'Status',
		cell: ({ row }) => {
			const status = row.getValue('status') as string

			const getStatusVariant = (status: string) => {
				switch (status) {
					case 'approved':
						return 'default'
					case 'pending':
						return 'secondary'
					case 'rejected':
						return 'destructive'
					default:
						return 'secondary'
				}
			}

			const getStatusColor = (status: string) => {
				switch (status) {
					case 'approved':
						return 'bg-green-100 text-green-800 hover:bg-green-100'
					case 'pending':
						return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
					case 'rejected':
						return 'bg-red-100 text-red-800 hover:bg-red-100'
					default:
						return ''
				}
			}

			return (
				<Badge
					variant={getStatusVariant(status)}
					className={getStatusColor(status)}
				>
					{status}
				</Badge>
			)
		},
	},
	{
		accessorKey: 'requestedAt',
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					Requested At
					<ArrowUpDown />
				</Button>
			)
		},
		cell: ({ row }) => {
			const date = new Date(row.getValue('requestedAt'))
			const formatted = date.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
			})
			return <div>{formatted}</div>
		},
	},
	{
		id: 'actions',
		enableHiding: false,
		cell: ({ row }) => {
			const kycRecord = row.original

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<span className="sr-only">Open menu</span>
							<MoreHorizontal />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuItem
							onClick={() => navigator.clipboard.writeText(kycRecord.id)}
						>
							Copy KYC ID
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem>View user details</DropdownMenuItem>
						<DropdownMenuItem>Review KYC documents</DropdownMenuItem>
						{kycRecord.status === 'pending' && (
							<>
								<DropdownMenuSeparator />
								<DropdownMenuItem>Approve KYC</DropdownMenuItem>
								<DropdownMenuItem>Reject KYC</DropdownMenuItem>
							</>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			)
		},
	},
]

export default function KycStatusTable() {
	const [sorting, setSorting] = React.useState<SortingState>([])
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	)
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({})
	const [rowSelection, setRowSelection] = React.useState({})

	const table = useReactTable({
		data: kycData,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
		},
	})

	return (
		<div className="w-full max-w-4xl mx-auto p-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">KYC Status Management</h1>
				<p className="text-muted-foreground">
					Manage and review customer verification requests
				</p>
			</div>

			<div className="flex items-center py-4">
				<Input
					placeholder="Filter users..."
					value={(table.getColumn('user')?.getFilterValue() as string) ?? ''}
					onChange={(event) =>
						table.getColumn('user')?.setFilterValue(event.target.value)
					}
					className="max-w-sm"
				/>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="ml-auto">
							Columns <ChevronDown />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{table
							.getAllColumns()
							.filter((column) => column.getCanHide())
							.map((column) => {
								return (
									<DropdownMenuCheckboxItem
										key={column.id}
										className="capitalize"
										checked={column.getIsVisible()}
										onCheckedChange={(value) =>
											column.toggleVisibility(!!value)
										}
									>
										{column.id}
									</DropdownMenuCheckboxItem>
								)
							})}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									)
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && 'selected'}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center justify-end space-x-2 py-4">
				<div className="text-muted-foreground flex-1 text-sm">
					{table.getFilteredSelectedRowModel().rows.length} of{' '}
					{table.getFilteredRowModel().rows.length} row(s) selected.
				</div>
				<div className="space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	)
}
