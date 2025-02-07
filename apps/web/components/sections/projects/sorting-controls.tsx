'use client'

import { ChevronDown } from 'lucide-react'
import { Button } from '~/components/base/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '~/components/base/dropdown-menu'

export type SortOption =
	| 'popular'
	| 'recent'
	| 'funded'
	| 'newest'
	| 'oldest'
	| 'alphabetical'

export const SORT_OPTIONS: Record<SortOption, string> = {
	popular: 'Popular Searches',
	recent: 'Most Recent',
	funded: 'Most Funded',
	newest: 'Newest',
	oldest: 'Oldest',
	alphabetical: 'Alphabetical',
}

interface SortingControlsProps {
	value: SortOption
	onChange: (value: SortOption) => void
}

export function SortingControls({ value, onChange }: SortingControlsProps) {
	return (
		<div className="flex items-center gap-4">
			<DropdownMenu aria-label="Sort projects">
				<DropdownMenuTrigger asChild>
					<Button variant="outline" className="gap-2">
						{SORT_OPTIONS[value]}
						<ChevronDown className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					{Object.entries(SORT_OPTIONS).map(([key, label]) => (
						<DropdownMenuItem
							key={key}
							onClick={() => onChange(key as SortOption)}
						>
							{label}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	)
}
