'use client'

import {
	FlameIcon as Fire,
	Star,
	TrendingUpIcon as Trending,
} from 'lucide-react'
import { useState } from 'react'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'

interface FilterSortProps {
	onFilterChange?: (value: string) => void
	onSortChange?: (value: string) => void
	initialFilter?: string
	initialSort?: string
}

export const FilterSort: React.FC<FilterSortProps> = ({
	onFilterChange,
	onSortChange,
	initialFilter = 'all',
	initialSort = 'trending',
}) => {
	const [filter, setFilter] = useState(initialFilter)
	const [sort, setSort] = useState(initialSort)

	const handleFilterChange = (value: string) => {
		setFilter(value)
		if (onFilterChange) onFilterChange(value)
	}

	const handleSortChange = (value: string) => {
		setSort(value)
		if (onSortChange) onSortChange(value)
	}

	return (
		<div className="flex flex-col sm:flex-row gap-4">
			<Select defaultValue={sort} onValueChange={handleSortChange}>
				<SelectTrigger className="w-[180px]">
					<SelectValue placeholder="Sort by" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="trending">
						<span className="flex items-center gap-2">
							<Trending className="h-4 w-4" />
							Trending
						</span>
					</SelectItem>
					<SelectItem value="mostFunded">
						<span className="flex items-center gap-2">
							<Star className="h-4 w-4" />
							Most Funded
						</span>
					</SelectItem>
					<SelectItem value="newest">
						<span className="flex items-center gap-2">
							<Fire className="h-4 w-4" />
							Newest
						</span>
					</SelectItem>
				</SelectContent>
			</Select>

			<Select defaultValue={filter} onValueChange={handleFilterChange}>
				<SelectTrigger className="w-[180px]">
					<SelectValue placeholder="Filter by category" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All Categories</SelectItem>
					<SelectItem value="education">Education</SelectItem>
					<SelectItem value="environment">Environment</SelectItem>
					<SelectItem value="health">Health</SelectItem>
					<SelectItem value="energy">Energy</SelectItem>
				</SelectContent>
			</Select>
		</div>
	)
}
