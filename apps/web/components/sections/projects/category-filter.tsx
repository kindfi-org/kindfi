import { motion } from 'framer-motion'
import Image from 'next/image'

const categories = [
	{
		id: 'sustainability',
		name: 'Sustainability',
		icon: '/icons/sustainability.svg',
	},
	{ id: 'education', name: 'Education', icon: '/icons/education.svg' },
	{ id: 'healthcare', name: 'Healthcare', icon: '/icons/healthcare.svg' },
	{ id: 'climate', name: 'Climate Action', icon: '/icons/climate.svg' },
	{ id: 'social', name: 'Social Equality', icon: '/icons/social.svg' },
	{ id: 'food', name: 'Food Security', icon: '/icons/food.svg' },
	{ id: 'water', name: 'Clean Water', icon: '/icons/water.svg' },
	{ id: 'energy', name: 'Clean Energy', icon: '/icons/energy.svg' },
	{ id: 'poverty', name: 'Poverty Relief', icon: '/icons/relief.svg' },
	{ id: 'community', name: 'Community', icon: '/icons/community.svg' },
]

interface CategoryFilterProps {
	selectedCategories: string[]
	onCategoryToggle: (category: string) => void
}

export function CategoryFilter({
	selectedCategories,
	onCategoryToggle,
}: CategoryFilterProps) {
	return (
		<div className="flex overflow-x-auto pb-4 pt-2 no-scrollbar px-1 my-8 gap-8">
			{categories.map((category) => (
				<motion.div
					key={category.id}
					whileHover={{ y: -5 }}
					transition={{ type: 'spring', stiffness: 400, damping: 10 }}
					className="flex flex-col items-center"
				>
					<button
						type="button"
						className={`w-[60px] h-[60px] rounded-full flex items-center justify-center transition-colors ${
							selectedCategories.includes(category.id)
								? 'bg-primary-200 text-primary-500'
								: 'bg-secondary-100 hover:bg-gray-200'
						}`}
						onClick={() => onCategoryToggle(category.id)}
					>
						<div className="w-6 h-6 relative">
							<Image
								src={category.icon}
								alt={category.name}
								fill
								className="object-contain"
							/>
						</div>
					</button>
					<span className="text-sm mt-2 text-center">{category.name}</span>
				</motion.div>
			))}
			<motion.div
				whileHover={{ y: -5 }}
				transition={{ type: 'spring', stiffness: 400, damping: 10 }}
				className="flex flex-col items-center"
			>
				<button
					type="button"
					className="w-[60px] h-[60px] rounded-full flex items-center justify-center bg-secondary-100 hover:bg-gray-200 transition-colors"
				>
					<span className="text-2xl">+</span>
				</button>
				<span className="text-sm mt-2 text-center">More</span>
			</motion.div>
		</div>
	)
}
