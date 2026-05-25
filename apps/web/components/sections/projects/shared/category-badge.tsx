'use client'

import type { Tables } from '@services/supabase'

import { cn } from '~/lib/utils'
import { categoryIcons } from '~/lib/utils/category-icons'
import { getContrastTextColor } from '~/lib/utils/color-utils'

interface CategoryBadgeProps {
	category: Tables<'categories'>
	selected?: boolean
	onClick?: () => void
	className?: string
	showIcon?: boolean
}

export function CategoryBadge({
	category,
	selected = false,
	onClick,
	className,
	showIcon = true,
}: CategoryBadgeProps) {
	const Icon = categoryIcons[category.name]
	const isInteractive = !!onClick

	const textColor = getContrastTextColor(category.color)

	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				'inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-[transform,colors]',
				isInteractive && 'cursor-pointer hover:scale-105 active:scale-95',
				selected
					? `${textColor} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`
					: 'border bg-white text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
				!isInteractive && 'cursor-default',
				className,
			)}
			style={{
				backgroundColor: selected ? category.color : undefined,
				borderColor: category.color,
				...(isInteractive && { '--tw-ring-color': category.color }),
			}}
			disabled={!isInteractive}
			aria-pressed={isInteractive ? selected : undefined}
			role={isInteractive ? 'button' : 'badge'}
			tabIndex={isInteractive ? 0 : -1}
			aria-label={
				isInteractive ? `Select category ${category.name}` : undefined
			}
		>
			{showIcon && Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
			<span
				className={cn(
					'overflow-hidden text-ellipsis',
					isInteractive
						? 'max-w-[160px] sm:max-w-full'
						: 'max-w-[90px] sm:max-w-full',
					'whitespace-nowrap',
				)}
				title={category.name}
			>
				{category.name}
			</span>
		</button>
	)
}
