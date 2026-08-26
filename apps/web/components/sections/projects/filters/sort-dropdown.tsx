'use client'

import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'

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
	const [isMounted, setIsMounted] = useState(false)
	const selectedOption = sortOptions.find((option) => option.value === value)

	useEffect(() => {
		setIsMounted(true)
	}, [])

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

	const triggerButton = (
		<Button
			variant="outline"
			className="flex items-center gap-2 rounded-full border-slate-200 bg-white px-4"
			aria-label={t('projects.sort')}
			aria-haspopup="listbox"
		>
			{selectedOption?.icon}
			{selectedOption && getSortLabel(selectedOption.value)}
			<ChevronDown className="h-4 w-4 ml-2" aria-hidden="true" />
		</Button>
	)

	if (!isMounted) {
		return triggerButton
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="w-[--radix-dropdown-menu-trigger-width] rounded-xl border-slate-200"
			>
				{sortOptions.map((option) => (
					<DropdownMenuItem
						key={option.value}
						onClick={() => onChange(option.value)}
						className="flex cursor-pointer items-center focus:bg-emerald-50 focus:text-emerald-900"
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
