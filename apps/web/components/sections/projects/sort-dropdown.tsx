'use client'

import { ChevronDown, Flame, Heart, Star, TrendingUp } from 'lucide-react'

import { Button } from '~/components/base/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '~/components/base/dropdown-menu'
import type { SortOption, SortOptionItem } from '~/lib/types/project'

const sortOptions: SortOptionItem[] = [
	{
		value: 'Most Popular',
		label: 'Most Popular',
		icon: <TrendingUp className="h-4 w-4 mr-2" aria-hidden="true" />,
	},
	{
		value: 'Most Funded',
		label: 'Most Funded',
		icon: <Star className="h-4 w-4 mr-2" aria-hidden="true" />,
	},
	{
		value: 'Most Recent',
		label: 'Most Recent',
		icon: <Flame className="h-4 w-4 mr-2" aria-hidden="true" />,
	},
	{
		value: 'Most Supporters',
		label: 'Most Supporters',
		icon: <Heart className="h-4 w-4 mr-2" aria-hidden="true" />,
	},
]

interface SortDropdownProps {
	value: SortOption
	onChange: (value: SortOption) => void
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
	const selectedOption = sortOptions.find((option) => option.value === value)

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					className="flex items-center gap-2 gradient-border-btn"
				>
					{selectedOption?.icon}
					{selectedOption?.label}
					<ChevronDown className="h-4 w-4 ml-2" aria-hidden="true" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="w-[--radix-dropdown-menu-trigger-width] gradient-border-btn"
			>
				{sortOptions.map((option) => (
					<DropdownMenuItem
						key={option.value}
						onClick={() => onChange(option.value)}
						className="flex items-center cursor-pointer focus:bg-green-100 focus:text-primary"
						aria-selected={option.value === value}
					>
						{option.icon}
						{option.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
