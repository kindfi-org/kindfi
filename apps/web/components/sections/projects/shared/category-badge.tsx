'use client'

import type { Tables } from '@services/supabase'
import type { CSSProperties } from 'react'

import { cn } from '~/lib/utils'
import { categoryIcons } from '~/lib/utils/category-icons'
import { getContrastTextColor, hexToRgba } from '~/lib/utils/color-utils'

type CategoryBadgeVariant = 'filter' | 'display'

interface CategoryBadgeProps {
	category: Tables<'categories'>
	selected?: boolean
	onClick?: () => void
	className?: string
	showIcon?: boolean
	variant?: CategoryBadgeVariant
}

export function CategoryBadge({
	category,
	selected = false,
	onClick,
	className,
	showIcon = true,
	variant = 'filter',
}: CategoryBadgeProps) {
	const Icon = categoryIcons[category.name]
	const isInteractive = !!onClick
	const textColor = getContrastTextColor(category.color)

	if (variant === 'display') {
		const label = (
			<>
				{showIcon && Icon ? (
					<span
						className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/20"
						aria-hidden="true"
					>
						<Icon className="h-2.5 w-2.5" />
					</span>
				) : null}
				<span className="truncate" title={category.name}>
					{category.name}
				</span>
			</>
		)

		const displayClassName = cn(
			'inline-flex max-w-[min(100%,11rem)] items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none shadow-sm backdrop-blur-md',
			textColor,
			className,
		)

		const displayStyle = {
			backgroundColor: hexToRgba(category.color, 0.92),
			boxShadow: '0 1px 2px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
		}

		if (isInteractive) {
			return (
				<button
					type="button"
					onClick={onClick}
					className={cn(
						displayClassName,
						'cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
					)}
					style={
						{
							...displayStyle,
							'--tw-ring-color': category.color,
						} as CSSProperties
					}
					aria-pressed={selected}
					aria-label={`Select category ${category.name}`}
				>
					{label}
				</button>
			)
		}

		return (
			<span className={displayClassName} style={displayStyle}>
				{label}
			</span>
		)
	}

	const filterLabel = (
		<>
			{showIcon && Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
			<span
				className={cn(
					'overflow-hidden text-ellipsis whitespace-nowrap',
					isInteractive ? 'max-w-40 sm:max-w-full' : 'max-w-22.5 sm:max-w-full',
				)}
				title={category.name}
			>
				{category.name}
			</span>
		</>
	)

	const filterClassName = cn(
		'inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-[transform,colors]',
		isInteractive && 'cursor-pointer hover:scale-105 active:scale-95',
		selected
			? `${textColor} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`
			: 'border bg-white text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
		!isInteractive && 'cursor-default',
		className,
	)

	const filterStyle = {
		backgroundColor: selected ? category.color : undefined,
		borderColor: category.color,
		...(isInteractive && { '--tw-ring-color': category.color }),
	}

	if (isInteractive) {
		return (
			<button
				type="button"
				onClick={onClick}
				className={filterClassName}
				style={filterStyle}
				aria-pressed={selected}
				aria-label={`Select category ${category.name}`}
			>
				{filterLabel}
			</button>
		)
	}

	return (
		<span className={filterClassName} style={filterStyle}>
			{filterLabel}
		</span>
	)
}
