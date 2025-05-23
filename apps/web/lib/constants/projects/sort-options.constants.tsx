import { Flame, Heart, Star, TrendingUp } from 'lucide-react'

import type { SortOptionItem } from '~/lib/types/project'

export const sortOptions: SortOptionItem[] = [
	{
		value: 'Most Popular',
		label: 'Most Popular',
		icon: <TrendingUp className="h-4 w-4 mr-2" aria-hidden="true" />,
	},
	{
		value: 'Most Funded',
		label: 'Most Funded',
		icon: <Star className="h-4 w-4 mr-2" aria-hidden="true" />,
	},
	{
		value: 'Most Recent',
		label: 'Most Recent',
		icon: <Flame className="h-4 w-4 mr-2" aria-hidden="true" />,
	},
	{
		value: 'Most Supporters',
		label: 'Most Supporters',
		icon: <Heart className="h-4 w-4 mr-2" aria-hidden="true" />,
	},
]

export const sortMap: Record<string, { column: string; ascending: boolean }> = {
	'most-funded': { column: 'current_amount', ascending: false },
	'most-recent': { column: 'created_at', ascending: false },
	'most-supporters': { column: 'investors_count', ascending: false },
	'most-popular': { column: 'title', ascending: true }, // Adjustable at discretion
}
