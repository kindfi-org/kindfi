'use client'

import { motion } from 'framer-motion'
import { GraduationCap, Leaf, Shield, Users } from 'lucide-react'
import { FaArrowRight } from 'react-icons/fa'
import { Card } from '~/components/base/card'
import type { ImpactCategory } from '~/lib/types/impact/impact-categories'

const icons = {
	GraduationCap,
	Leaf,
	Shield,
	Users,
} as const

interface CategoryCardProps {
	category: ImpactCategory
	index: number
}

export function CategoryCard({ category, index }: CategoryCardProps) {
	const Icon = icons[category.icon as keyof typeof icons]

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: index * 0.1 }}
			viewport={{ once: true }}
		>
			<Card className="p-8 space-y-6 rounded-3xl">
				<div className="space-y-6">
					<div className="h-14 w-14 rounded-2xl bg-gray-300 flex items-center justify-center">
						<Icon className="h-7 w-7" />
					</div>
					<h3 className="text-2xl font-bold">{category.title}</h3>
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between text-gray-600">
						<span>Total Funded</span>
						<span className="font-bold text-black">
							${category.totalFunded.toLocaleString()}
						</span>
					</div>
					<div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
						<div className="h-full w-3/4 bg-black rounded-full" />
					</div>
				</div>

				<div className="flex items-center justify-between text-gray-600">
					<span>Active Projects</span>
					<span className="font-bold text-black">
						{category.activeProjects}
					</span>
				</div>

				<div className="flex items-center gap-2 text-sm">
					<FaArrowRight />
					<span>{category.growthRate}% growth this year</span>
				</div>
			</Card>
		</motion.div>
	)
}
