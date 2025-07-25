'use client'

import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '~/components/base/pagination'

interface PaginationProps {
	currentPage: number
	totalPages: number
	onPageChange: (page: number) => void
}

export function Paginations({
	currentPage,
	totalPages,
	onPageChange,
}: PaginationProps) {
	const generatePageNumbers = () => {
		const pages = []
		const maxVisiblePages = 5

		if (totalPages <= maxVisiblePages) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i)
			}
		} else {
			pages.push(1)

			const startPage = Math.max(2, currentPage - 1)
			const endPage = Math.min(totalPages - 1, currentPage + 1)

			if (startPage > 2) {
				pages.push(-1)
			}

			for (let i = startPage; i <= endPage; i++) {
				pages.push(i)
			}

			if (endPage < totalPages - 1) {
				pages.push(-2)
			}
			pages.push(totalPages)
		}

		return pages
	}

	const pageNumbers = generatePageNumbers()

	return (
		<Pagination>
			<PaginationContent>
				<PaginationItem>
					<PaginationPrevious
						href="#"
						onClick={(e) => {
							e.preventDefault()
							if (currentPage > 1) onPageChange(currentPage - 1)
						}}
						className={
							currentPage === 1 ? 'pointer-events-none opacity-50' : ''
						}
					/>
				</PaginationItem>

				{pageNumbers.map((page, _index) => {
					if (page === -1 || page === -2) {
						return (
							<PaginationItem key={`ellipsis-${page}`}>
								<PaginationEllipsis aria-label="More pages" />
							</PaginationItem>
						)
					}

					return (
						<PaginationItem key={page}>
							<PaginationLink
								type="button"
								aria-label={`Go to page ${page}`}
								aria-current={page === currentPage ? 'page' : undefined}
								href="#"
								onClick={(e) => {
									e.preventDefault()
									onPageChange(page)
								}}
								isActive={page === currentPage}
								className={
									page === currentPage
										? 'bg-blue-100 text-blue-600'
										: 'hover:bg-blue-50'
								}
							>
								{page}
							</PaginationLink>
						</PaginationItem>
					)
				})}

				<PaginationItem>
					<PaginationNext
						href="#"
						onClick={(e) => {
							e.preventDefault()
							if (currentPage < totalPages) onPageChange(currentPage + 1)
						}}
						className={
							currentPage === totalPages ? 'pointer-events-none opacity-50' : ''
						}
					/>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	)
}
