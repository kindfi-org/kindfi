'use client'

import { Building2, Calendar, ChevronDown, Heart, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Button } from '~/components/base/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '~/components/base/dropdown-menu'
import { useI18n } from '~/lib/i18n'
import {
	FOUNDATION_LIST_SORT_NAV,
	type FoundationListSortSlug,
} from '~/lib/queries/foundations/get-all-foundations'

const sortIcons: Record<FoundationListSortSlug, ReactNode> = {
	'most-recent': <Sparkles className="h-4 w-4" aria-hidden="true" />,
	'most-donations': <Heart className="h-4 w-4" aria-hidden="true" />,
	'most-campaigns': <Building2 className="h-4 w-4" aria-hidden="true" />,
	newest: <Calendar className="h-4 w-4" aria-hidden="true" />,
	oldest: <Calendar className="h-4 w-4" aria-hidden="true" />,
}

interface FoundationsSortDropdownProps {
	value: FoundationListSortSlug
	onChange: (value: FoundationListSortSlug) => void
}

export function FoundationsSortDropdown({ value, onChange }: FoundationsSortDropdownProps) {
	const { t } = useI18n()
	const [isMounted, setIsMounted] = useState(false)

	useEffect(() => {
		setIsMounted(true)
	}, [])

	const getSortLabel = (slug: FoundationListSortSlug) => {
		switch (slug) {
			case 'most-recent':
				return t('foundations.sortMostRecent')
			case 'most-donations':
				return t('foundations.sortMostDonations')
			case 'most-campaigns':
				return t('foundations.sortMostCampaigns')
			case 'newest':
				return t('foundations.sortNewestYear')
			case 'oldest':
				return t('foundations.sortOldestYear')
			default:
				return slug
		}
	}

	const triggerButton = (
		<Button
			variant="outline"
			className="flex items-center gap-2 rounded-full border-slate-200 bg-white px-4"
			aria-label={t('foundations.sort')}
			aria-haspopup="listbox"
		>
			{sortIcons[value]}
			{getSortLabel(value)}
			<ChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />
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
				{FOUNDATION_LIST_SORT_NAV.map(({ slug }) => (
					<DropdownMenuItem
						key={slug}
						onClick={() => onChange(slug)}
						className="flex cursor-pointer items-center gap-2 focus:bg-emerald-50 focus:text-emerald-900"
						aria-selected={slug === value}
					>
						{sortIcons[slug]}
						{getSortLabel(slug)}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
