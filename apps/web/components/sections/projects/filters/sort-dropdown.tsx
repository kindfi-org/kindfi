'use client'

import { ChevronDown } from 'lucide-react'

import { Button } from '~/components/base/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '~/components/base/dropdown-menu'
import { sortOptions } from '~/lib/constants/projects'
import { useI18n } from '~/lib/i18n'
import type { SortOption } from '~/lib/types/project'

interface SortDropdownProps {
	value: SortOption
	onChange: (value: SortOption) => void
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
	const { t } = useI18n()
	const selectedOption = sortOptions.find((option) => option.value === value)
	
	// Translate sort option labels
	const getSortLabel = (option: SortOption) => {
		switch (option) {
			case 'Most Popular':
				return t('projects.sortMostPopular')
			case 'Most Recent':
				return t('projects.sortMostRecent')
			case 'Most Funded':
				return t('projects.sortAlmostFunded')
			case 'Most Supporters':
				return t('projects.sortMostSupporters')
			default:
				return option
		}
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
			<Button
				variant="outline"
				className="flex items-center gap-2 gradient-border-btn"
			>
				{selectedOption?.icon}
				{selectedOption && getSortLabel(selectedOption.value)}
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
					{getSortLabel(option.value)}
				</DropdownMenuItem>
			))}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
