import { CategoryCard } from '~/components/cards/category-card'
import type { Category } from '~/lib/types/learning.types'

interface CategoryGridProps {
	categories: Category[]
}

export function CategoryGrid({ categories }: CategoryGridProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto px-4">
			{categories.map((category) => (
				<CategoryCard
					key={category.name}
					name={category.name}
					description={category.description}
					slug={category.slug}
					type={category.type}
					icon={category.icon}
				/>
			))}
		</div>
	)
}
