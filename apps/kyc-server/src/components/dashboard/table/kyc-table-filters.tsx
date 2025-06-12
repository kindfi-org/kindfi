import type { Table } from '@tanstack/react-table'
import { ChevronDownIcon, ColumnsIcon, FilterIcon } from 'lucide-react'

import { Button } from '~/components/base/button'
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '~/components/base/dropdown-menu'
import { Label } from '~/components/base/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'
import type { KycRecord } from '~/lib/types/dashboard'

interface KycTableFiltersProps {
	statusFilter: string
	verificationLevelFilter: string
	onStatusFilterChange: (value: string) => void
	onVerificationLevelFilterChange: (value: string) => void
	table: Table<KycRecord>
}

export function KycTableFilters({
	statusFilter,
	verificationLevelFilter,
	onStatusFilterChange,
	onVerificationLevelFilterChange,
	table,
}: KycTableFiltersProps) {
	return (
		<div className="flex flex-col gap-4 px-4 sm:flex-row sm:items-center lg:px-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
				<div className="flex items-center gap-2">
					<FilterIcon
						className="size-4 text-muted-foreground"
						aria-hidden="true"
					/>
					<Label htmlFor="status-filter" className="text-sm font-medium">
						Status:
					</Label>
					<Select value={statusFilter} onValueChange={onStatusFilterChange}>
						<SelectTrigger
							className="w-32"
							id="status-filter"
							aria-label="Filter by status"
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All</SelectItem>
							<SelectItem value="pending">Pending</SelectItem>
							<SelectItem value="approved">Approved</SelectItem>
							<SelectItem value="rejected">Rejected</SelectItem>
							<SelectItem value="verified">Verified</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-center gap-2">
					<Label htmlFor="level-filter" className="text-sm font-medium">
						Level:
					</Label>
					<Select
						value={verificationLevelFilter}
						onValueChange={onVerificationLevelFilterChange}
					>
						<SelectTrigger
							className="w-32"
							id="level-filter"
							aria-label="Filter by verification level"
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All</SelectItem>
							<SelectItem value="basic">Basic</SelectItem>
							<SelectItem value="enhanced">Enhanced</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="sm:ml-auto">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							size="sm"
							aria-label="Customize table columns"
						>
							<ColumnsIcon className="size-4" aria-hidden="true" />
							<span className="hidden lg:inline">Customize Columns</span>
							<span className="lg:hidden">Columns</span>
							<ChevronDownIcon className="size-4" aria-hidden="true" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-56">
						{table
							.getAllColumns()
							.filter(
								(column) =>
									typeof column.accessorFn !== 'undefined' &&
									column.getCanHide(),
							)
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
										{column.id.replace('_', ' ')}
									</DropdownMenuCheckboxItem>
								)
							})}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	)
}
