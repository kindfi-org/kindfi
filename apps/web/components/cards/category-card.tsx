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
	const Icon = iconMap[type as keyof typeof iconMap] || LayoutGrid

	return (
		<Link href={`/learn/${slug}`}>
			<div
				className={`p-6 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}
			>
				<div className="bg-muted rounded-full w-12 h-12 flex items-center justify-center mb-4">
					<Icon className="w-6 h-6 text-muted-foreground" />
				</div>
				<h3 className="text-xl font-semibold mb-2">{name}</h3>
				<p className="text-muted-foreground text-base">{description}</p>
			</div>
		</Link>
	)
}
