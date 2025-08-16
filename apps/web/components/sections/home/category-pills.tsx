'use client'

import type { Tables } from '@services/supabase'
import { useRouter } from 'next/navigation'

import { cn } from '~/lib/utils'
import { CategoryBadge } from '~/components/sections/projects/shared'
import { CategoryBadgeSkeleton } from '~/components/sections/projects/skeletons'
import { buildProjectsCategoryUrl } from '~/lib/utils'

interface CategoryPillsProps {
	categories: Tables<'categories'>[]
	isLoading: boolean
	error?: unknown
	className?: string
	onCategoryClick?: (category: Tables<'categories'>) => void
	/** If true (default), clicking will navigate to the projects page filtered by category using the slug */
	enableDefaultNavigation?: boolean
	/** Custom URL builder. If provided, overrides the default URL builder */
	buildUrl?: (category: Tables<'categories'>) => string
}

export function CategoryPills({
	categories,
	isLoading,
	error,
	className,
	onCategoryClick,
	enableDefaultNavigation = true,
	buildUrl,
}: CategoryPillsProps) {
	const router = useRouter()

	const handleCategoryClick =
		onCategoryClick ||
		(enableDefaultNavigation
			? (category: Tables<'categories'>) => {
				if (!category.slug) return
				const href = buildUrl
					? buildUrl(category)
					: buildProjectsCategoryUrl(category.slug as string)
				router.push(href)
			}
			: undefined)

	return (
		<div className={cn('mt-8 flex flex-wrap justify-center gap-2', className)}>
			{isLoading ? (
				<div className="flex flex-wrap gap-2">
					{Array.from({ length: 12 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: using index as key is acceptable here
						<CategoryBadgeSkeleton key={i} />
					))}
				</div>
			) : error ? (
				<p className="text-sm text-destructive text-center w-full">
					Failed to load categories. Please try again later.
				</p>
			) : (
				categories.map((category) => (
					<CategoryBadge
						key={category.id}
						category={category}
						onClick={handleCategoryClick ? () => handleCategoryClick(category) : undefined}
					/>
				))
			)}
		</div>
	)
}


