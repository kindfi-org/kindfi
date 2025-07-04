import type { Table } from '@tanstack/react-table'
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronsLeftIcon,
	ChevronsRightIcon,
} from 'lucide-react'

import { Button } from '~/components/base/button'
import { Label } from '~/components/base/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'
import type { KycRecord } from '~/lib/types/dashboard'

interface KycTablePaginationProps {
	table: Table<KycRecord>
}

export function KycTablePagination({ table }: KycTablePaginationProps) {
	return (
		<div className="flex flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between">
			<div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
				{table.getFilteredSelectedRowModel().rows.length} of{' '}
				{table.getFilteredRowModel().rows.length} row(s) selected.
			</div>

			<div className="flex w-full flex-col gap-4 sm:w-fit sm:flex-row sm:items-center sm:gap-8">
				<div className="hidden items-center gap-2 lg:flex">
					<Label htmlFor="rows-per-page" className="text-sm font-medium">
						Rows per page
					</Label>
					<Select
						value={`${table.getState().pagination.pageSize}`}
						onValueChange={(value) => {
							table.setPageSize(Number(value))
						}}
					>
						<SelectTrigger
							className="w-20"
							id="rows-per-page"
							aria-label="Select rows per page"
						>
							<SelectValue placeholder={table.getState().pagination.pageSize} />
						</SelectTrigger>
						<SelectContent side="top">
							{[10, 20, 30, 40, 50].map((pageSize) => (
								<SelectItem key={pageSize} value={`${pageSize}`}>
									{pageSize}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex w-fit items-center justify-center text-sm font-medium">
					Page {table.getState().pagination.pageIndex + 1} of{' '}
					{table.getPageCount()} {table.getPageCount() === 1 ? 'page' : 'pages'}
				</div>

				<div className="flex items-center gap-2 justify-center sm:justify-start">
					<Button
						variant="outline"
						className="hidden h-8 w-8 p-0 lg:flex"
						onClick={() => table.setPageIndex(0)}
						disabled={!table.getCanPreviousPage()}
						aria-label="Go to first page"
					>
						<span className="sr-only">Go to first page</span>
						<ChevronsLeftIcon className="size-4" aria-hidden="true" />
					</Button>
					<Button
						variant="outline"
						className="size-8"
						size="icon"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
						aria-label="Go to previous page"
					>
						<span className="sr-only">Go to previous page</span>
						<ChevronLeftIcon className="size-4" aria-hidden="true" />
					</Button>
					<Button
						variant="outline"
						className="size-8"
						size="icon"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
						aria-label="Go to next page"
					>
						<span className="sr-only">Go to next page</span>
						<ChevronRightIcon className="size-4" aria-hidden="true" />
					</Button>
					<Button
						variant="outline"
						className="hidden size-8 lg:flex"
						size="icon"
						onClick={() => table.setPageIndex(table.getPageCount() - 1)}
						disabled={!table.getCanNextPage()}
						aria-label="Go to last page"
					>
						<span className="sr-only">Go to last page</span>
						<ChevronsRightIcon className="size-4" aria-hidden="true" />
					</Button>
				</div>
			</div>
		</div>
	)
}
