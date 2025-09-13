import type { Table } from '@tanstack/react-table'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

import { Button } from '~/components/base/button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'

interface UserTablePaginationProps<TData> {
	table: Table<TData>
}

export function UserTablePagination<TData>({
	table,
}: UserTablePaginationProps<TData>) {
	const currentPage = table.getState().pagination.pageIndex + 1
	const pageCount = table.getPageCount()
	const pageSize = table.getState().pagination.pageSize
	const totalRows = table.getFilteredRowModel().rows.length

	const startRow = table.getState().pagination.pageIndex * pageSize + 1
	const endRow = Math.min(
		(table.getState().pagination.pageIndex + 1) * pageSize,
		totalRows,
	)

	return (
		<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				<span>
					Showing {totalRows > 0 ? startRow : 0} to {endRow} of {totalRows}{' '}
					users
				</span>
			</div>

			<div className="flex items-center gap-6">
				{/* Page Size Selector */}
				<div className="flex items-center gap-2 text-sm">
					<span className="text-muted-foreground">Rows per page</span>
					<Select
						value={`${pageSize}`}
						onValueChange={(value) => {
							table.setPageSize(Number(value))
						}}
					>
						<SelectTrigger className="h-8 w-[70px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent side="top">
							{[10, 20, 30, 40, 50].map((pageSizeOption) => (
								<SelectItem key={pageSizeOption} value={`${pageSizeOption}`}>
									{pageSizeOption}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Page Navigation */}
				<div className="flex items-center gap-2">
					<span className="text-sm text-muted-foreground">
						Page {currentPage} of {pageCount}
					</span>

					<div className="flex items-center gap-1">
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
							className="h-8 w-8 p-0"
						>
							<span className="sr-only">Go to previous page</span>
							<ChevronLeftIcon className="h-4 w-4" />
						</Button>

						<Button
							variant="outline"
							size="sm"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
							className="h-8 w-8 p-0"
						>
							<span className="sr-only">Go to next page</span>
							<ChevronRightIcon className="h-4 w-4" />
						</Button>
					</div>
				</div>

				{/* Jump to Page */}
				{pageCount > 1 && (
					<div className="flex items-center gap-2 text-sm">
						<span className="text-muted-foreground">Go to page</span>
						<Select
							value={`${currentPage}`}
							onValueChange={(value) => {
								const pageIndex = Number(value) - 1
								table.setPageIndex(pageIndex)
							}}
						>
							<SelectTrigger className="h-8 w-[70px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent side="top" className="max-h-[200px]">
								{Array.from({ length: pageCount }, (_, i) => i + 1).map(
									(page) => (
										<SelectItem key={page} value={`${page}`}>
											{page}
										</SelectItem>
									),
								)}
							</SelectContent>
						</Select>
					</div>
				)}
			</div>
		</div>
	)
}
