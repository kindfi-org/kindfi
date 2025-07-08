'use client'

import type { Tables } from '@services/supabase'
import { motion } from 'framer-motion'

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
		<motion.button
			whileHover={{ scale: isInteractive ? 1.05 : 1 }}
			whileTap={{ scale: isInteractive ? 0.95 : 1 }}
			onClick={onClick}
			className={cn(
				'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
				selected
					? `${textColor === 'white' ? 'text-white' : 'text-black'} focus:ring-2 focus:ring-offset-2`
					: 'text-gray-700 bg-white border hover:bg-gray-50 focus:ring-2 focus:ring-offset-2',
				isInteractive ? 'cursor-pointer' : 'cursor-default',
				className,
			)}
			style={{
				backgroundColor: selected ? category.color : undefined,
				borderColor: category.color,
				// Set focus ring color to match category color
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
					'whitespace-nowrap overflow-hidden text-ellipsis',
					isInteractive
						? 'max-w-[230px] sm:max-w-full'
						: 'max-w-[100px] sm:max-w-full',
				)}
				title={category.name}
			>
				{category.name}
			</span>
		</motion.button>
	)
}
