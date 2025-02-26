// src/components/CategoryTag/CategoryTag.tsx
'use client'

import type React from 'react'
import type { ProjectCategory } from '~/components/types/project.types'

interface CategoryTagProps {
	category: ProjectCategory
	isActive?: boolean
	onClick?: () => void
}

export const CategoryTag: React.FC<CategoryTagProps> = ({
	category,
	isActive = false,
	onClick,
}) => {
	const Icon = category.icon

	return (
		<button
			className={`category-tag category-tag--${category.id} ${isActive ? 'category-tag--active' : ''}`}
			onClick={onClick}
			type="button"
		>
			<Icon className="category-icon" />
			{category.label}
		</button>
	)
}
