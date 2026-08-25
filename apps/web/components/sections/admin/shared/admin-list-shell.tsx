'use client'

import { ChevronLeft, ChevronRight, RotateCcw, Search } from 'lucide-react'
import { type ReactNode, useEffect, useId, useRef, useState } from 'react'
import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import { Skeleton } from '~/components/base/skeleton'

const SEARCH_DEBOUNCE_MS = 300

interface AdminListShellProps {
	/** Current search value from the URL params. */
	searchValue: string
	onSearchChange: (value: string) => void
	searchPlaceholder?: string
	/** Filter and sort controls rendered next to the search input. */
	filters?: ReactNode
	isLoading: boolean
	isError: boolean
	onRetry: () => void
	total: number
	page: number
	pageSize: number
	onPageChange: (page: number) => void
	emptyTitle: string
	emptyDescription: string
	/** Whether any filter/search is active, to explain empty states. */
	hasActiveFilters?: boolean
	onResetFilters?: () => void
	skeletonRowHeight?: number
	children: ReactNode
}

/**
 * Shared chrome for admin list surfaces: debounced search, filter slot,
 * result count, layout-preserving loading state, empty and error states with
 * a retry path, and pagination. Keeps every admin list consistent.
 */
export function AdminListShell({
	searchValue,
	onSearchChange,
	searchPlaceholder = 'Search…',
	filters,
	isLoading,
	isError,
	onRetry,
	total,
	page,
	pageSize,
	onPageChange,
	emptyTitle,
	emptyDescription,
	hasActiveFilters = false,
	onResetFilters,
	skeletonRowHeight = 88,
	children,
}: AdminListShellProps) {
	const searchInputId = useId()
	const [searchDraft, setSearchDraft] = useState(searchValue)
	const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
	const lastSubmitted = useRef(searchValue)

	// Keep the draft in sync when the URL changes externally (back/forward).
	useEffect(() => {
		if (searchValue !== lastSubmitted.current) {
			lastSubmitted.current = searchValue
			setSearchDraft(searchValue)
		}
	}, [searchValue])

	useEffect(() => {
		return () => {
			if (debounceTimer.current) clearTimeout(debounceTimer.current)
		}
	}, [])

	const handleSearchInput = (value: string) => {
		setSearchDraft(value)
		if (debounceTimer.current) clearTimeout(debounceTimer.current)
		debounceTimer.current = setTimeout(() => {
			lastSubmitted.current = value
			onSearchChange(value)
		}, SEARCH_DEBOUNCE_MS)
	}

	const pageCount = Math.max(1, Math.ceil(total / pageSize))
	const isEmpty = !isLoading && !isError && total === 0
	// A bookmarked URL can request a page beyond the current result set.
	const isPageOutOfRange = !isLoading && !isError && total > 0 && page > pageCount

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 md:flex-row md:items-center">
				<div className="relative w-full md:max-w-sm">
					<Search
						className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
						aria-hidden="true"
					/>
					<label htmlFor={searchInputId} className="sr-only">
						{searchPlaceholder}
					</label>
					<Input
						id={searchInputId}
						type="search"
						value={searchDraft}
						onChange={(event) => handleSearchInput(event.target.value)}
						placeholder={searchPlaceholder}
						className="pl-9"
					/>
				</div>
				{filters ? <div className="flex flex-wrap items-center gap-2">{filters}</div> : null}
			</div>

			{!isLoading && !isError ? (
				<p className="text-sm text-muted-foreground" aria-live="polite">
					{total === 1 ? '1 result' : `${total.toLocaleString('en-US')} results`}
				</p>
			) : null}

			{isError ? (
				<div
					role="alert"
					className="flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center"
				>
					<p className="font-medium">Something went wrong while loading this list.</p>
					<Button type="button" variant="outline" onClick={onRetry}>
						<RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
						Retry
					</Button>
				</div>
			) : isLoading ? (
				<output aria-label="Loading results" className="block space-y-3">
					{['a', 'b', 'c', 'd', 'e'].map((key) => (
						<Skeleton
							key={key}
							className="w-full rounded-lg"
							style={{ height: skeletonRowHeight }}
						/>
					))}
				</output>
			) : isPageOutOfRange ? (
				<div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-center">
					<p className="font-medium">Page {page} is out of range</p>
					<p className="text-sm text-muted-foreground">
						These results only have {pageCount} {pageCount === 1 ? 'page' : 'pages'}.
					</p>
					<Button type="button" variant="outline" size="sm" onClick={() => onPageChange(pageCount)}>
						Go to page {pageCount}
					</Button>
				</div>
			) : isEmpty ? (
				<div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-center">
					<p className="font-medium">{emptyTitle}</p>
					<p className="text-sm text-muted-foreground">
						{hasActiveFilters
							? 'No records match the current filters. Try adjusting or clearing them.'
							: emptyDescription}
					</p>
					{hasActiveFilters && onResetFilters ? (
						<Button type="button" variant="outline" size="sm" onClick={onResetFilters}>
							Clear filters
						</Button>
					) : null}
				</div>
			) : (
				<>
					{children}
					{pageCount > 1 ? (
						<nav
							aria-label="Pagination"
							className="flex items-center justify-between gap-4 border-t pt-4"
						>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => onPageChange(page - 1)}
								disabled={page <= 1}
							>
								<ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
								Previous
							</Button>
							<p className="text-sm text-muted-foreground">
								Page {page} of {pageCount}
							</p>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => onPageChange(page + 1)}
								disabled={page >= pageCount}
							>
								Next
								<ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
							</Button>
						</nav>
					) : null}
				</>
			)}
		</div>
	)
}
