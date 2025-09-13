'use client'

import type { Table } from '@tanstack/react-table'
import { SearchIcon, XIcon } from 'lucide-react'
import { useState, useCallback } from 'react'

import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'

interface UserTableFiltersProps {
	search: string
	statusFilter: string
	verificationLevelFilter: string
	onSearchChange: (search: string) => void
	onStatusFilterChange: (status: string) => void
	onVerificationLevelFilterChange: (level: string) => void
	table: Table<any>
}

export function UserTableFilters({
	search,
	statusFilter,
	verificationLevelFilter,
	onSearchChange,
	onStatusFilterChange,
	onVerificationLevelFilterChange,
	table,
}: UserTableFiltersProps) {
	const [searchInput, setSearchInput] = useState(search)

	const handleSearchSubmit = useCallback(() => {
		onSearchChange(searchInput)
	}, [searchInput, onSearchChange])

	const handleSearchClear = useCallback(() => {
		setSearchInput('')
		onSearchChange('')
	}, [onSearchChange])

	const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleSearchSubmit()
		}
	}, [handleSearchSubmit])

	const hasActiveFilters = search || statusFilter !== 'all' || verificationLevelFilter !== 'all'

	const clearAllFilters = useCallback(() => {
		setSearchInput('')
		onSearchChange('')
		onStatusFilterChange('all')
		onVerificationLevelFilterChange('all')
	}, [onSearchChange, onStatusFilterChange, onVerificationLevelFilterChange])

	return (
		<div className="space-y-4 px-4 lg:px-6">
			{/* Header */}
			<div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
				<div>
					<h2 className="text-xl font-semibold">Users & KYC Management</h2>
					<p className="text-sm text-muted-foreground">
						Manage user verification status and KYC reviews
					</p>
				</div>
				
				{hasActiveFilters && (
					<Button
						variant="outline"
						size="sm"
						onClick={clearAllFilters}
						className="w-fit"
					>
						<XIcon className="mr-2 size-4" />
						Clear Filters
					</Button>
				)}
			</div>

			{/* Search and Filters */}
			<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				{/* Search */}
				<div className="flex flex-1 gap-2 max-w-md">
					<div className="relative flex-1">
						<SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Search by user ID, email, or name..."
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							onKeyDown={handleKeyDown}
							className="pl-9"
						/>
					</div>
					<Button 
						onClick={handleSearchSubmit}
						disabled={searchInput === search}
					>
						Search
					</Button>
				</div>

				{/* Filter Controls */}
				<div className="flex gap-2">
					<Select value={statusFilter} onValueChange={onStatusFilterChange}>
						<SelectTrigger className="w-[140px]">
							<SelectValue placeholder="KYC Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Status</SelectItem>
							<SelectItem value="pending">Pending</SelectItem>
							<SelectItem value="approved">Approved</SelectItem>
							<SelectItem value="rejected">Rejected</SelectItem>
						</SelectContent>
					</Select>

					<Select 
						value={verificationLevelFilter} 
						onValueChange={onVerificationLevelFilterChange}
					>
						<SelectTrigger className="w-[160px]">
							<SelectValue placeholder="Verification Level" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Levels</SelectItem>
							<SelectItem value="basic">Basic</SelectItem>
							<SelectItem value="enhanced">Enhanced</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Active Filters Display */}
			{hasActiveFilters && (
				<div className="flex flex-wrap gap-2 items-center text-sm">
					<span className="text-muted-foreground">Active filters:</span>
					{search && (
						<div className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded">
							<SearchIcon className="size-3" />
							<span>"{search}"</span>
						</div>
					)}
					{statusFilter !== 'all' && (
						<div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded">
							Status: {statusFilter}
						</div>
					)}
					{verificationLevelFilter !== 'all' && (
						<div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded">
							Level: {verificationLevelFilter}
						</div>
					)}
				</div>
			)}

			{/* Results Summary */}
			<div className="text-sm text-muted-foreground">
				{table.getFilteredRowModel().rows.length > 0 ? (
					<>
						Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
						{Math.min(
							(table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
							table.getFilteredRowModel().rows.length
						)} of {table.getFilteredRowModel().rows.length} users
						{hasActiveFilters && ' (filtered)'}
					</>
				) : (
					'No users found matching the current filters'
				)}
			</div>
		</div>
	)
}