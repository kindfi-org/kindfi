import { CategoryCard } from '~/components/cards/category-card'
import type { Category } from '~/lib/types/learning.types'

interface CategoryGridProps {
	categories: Category[]
}

export function CategoryGrid({ categories }: CategoryGridProps) {
	return (
		<div className="grid-auto-fit-wide max-w-6xl mx-auto">
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
