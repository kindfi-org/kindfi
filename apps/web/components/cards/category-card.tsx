import { LayoutGrid, Shield, ShieldCheck, Zap } from 'lucide-react'
import Link from 'next/link'
import type { Category } from '~/lib/types/learning.types'

const iconMap = {
	crowdfunding: LayoutGrid,
	blockchain: Shield,
	web3: Zap,
	security: ShieldCheck,
} as const

interface CategoryCardProps extends Category {
	className?: string
	slug: string
	type: keyof typeof iconMap
}

export function CategoryCard({
	name,
	description,
	slug,
	type,
	className = '',
}: CategoryCardProps) {
	const Icon = iconMap[type] || LayoutGrid

	return (
		<Link href={`/learn/${slug}`} className="block w-full" legacyBehavior>
			<div
				className={`
        h-64 
        w-full
        flex 
        flex-col 
        items-center 
        text-center 
        p-8 
        bg-white 
        rounded-xl 
        shadow-sm 
        hover:shadow-md 
        transition-all 
        duration-300 
        ${className}
      `}
			>
				{/* Icon Container */}
				<div className="bg-gray-100 rounded-2xl w-16 h-16 flex items-center justify-center mb-6">
					<Icon className="w-8 h-8 text-gray-600" />
				</div>

				{/* Content Container - Fixed Height */}
				<div className="flex flex-col flex-grow justify-between">
					<h3 className="text-xl font-semibold mb-3">{name}</h3>
					<p className="text-gray-500 text-base line-clamp-3">{description}</p>
				</div>
			</div>
		</Link>
	)
}
