import {
	Baby,
	Coins,
	Droplets,
	GraduationCap,
	HandHelping,
	Heart,
	Leaf,
	LineChart,
	MessageSquare,
	Newspaper,
	Rocket,
	ShieldAlert,
	Sprout,
	Stethoscope,
	UtensilsCrossed,
} from 'lucide-react'
import type React from 'react'
import { Badge } from '~/components/base/badge'
import type { Tag, TMoney, TPercentage } from '~/lib/types'
import { getA11yColorMatch } from './color-utils'

/** Helper function to create monetary values */
export function createMoney(value: number): TMoney {
	if (value < 0) throw new Error('Money cannot be negative')
	return Number(value.toFixed(2)) as TMoney
}

/** Helper function to validate image URLs */
export function createImageUrl(url: string): string {
	try {
		new URL(url)
		return url
	} catch {
		throw new Error('Invalid image URL')
	}
}

/** Helper function to validate and create percentage values */
export function createPercentage(value: number): TPercentage {
	if (value < 0 || value > 100) {
		throw new Error('Percentage must be between 0 and 100')
	}
	return value as TPercentage
}

export function getTagColors(tag: Tag | string): {
	backgroundColor: string
	color: string
} {
	return typeof tag === 'string'
		? { backgroundColor: '#E5E7EB', color: '#374151' }
		: typeof tag.color !== 'string'
			? {
					backgroundColor: tag.color?.backgroundColor ?? '',
					color: tag.color?.textColor ?? '',
				}
			: {
					backgroundColor: tag.color,
					color: getA11yColorMatch(tag.color)[1], // Use accessible text color
				}
}

/**
 * Maps category names to appropriate colors and Lucide icons
 */
export const getCategoryStyles = (category: string) => {
	const categoryMap: Record<string, { color: string; icon: React.ReactNode }> =
		{
			'Animal Welfare': {
				color:
					'bg-rose-50/80 text-rose-700 hover:bg-rose-100/80 active:bg-rose-100/80 border-rose-200/50',
				icon: <Heart className="w-4 h-4" />,
			},
			'Child Welfare': {
				color:
					'bg-purple-50/80 border-purple-200/50 text-purple-700 hover:bg-purple-200/80 active:bg-purple-200/80',
				icon: <Baby className="w-4 h-4" />,
			},
			'Environmental Protection': {
				color:
					'bg-green-50/80 text-green-700 hover:bg-green-100/80 active:bg-green-100/80 border-green-200/50',
				icon: <Leaf className="w-4 h-4" />,
			},
			'Disaster Relief': {
				color:
					'bg-red-50/80 text-red-700 hover:bg-red-100/80 active:bg-red-100/80 border-red-200/50',
				icon: <ShieldAlert className="w-4 h-4" />,
			},
			'Culture and Arts': {
				color:
					'bg-blue-50/80 text-blue-700 hover:bg-blue-100/80 active:bg-blue-100/80 border-blue-200/50',
				icon: <MessageSquare className="w-4 h-4" />,
			},
			'Access to Clean Water': {
				color:
					'bg-cyan-50/80 border-cyan-200/50 text-cyan-700 hover:bg-cyan-200/80 active:bg-cyan-200/80',
				icon: <Droplets className="w-4 h-4" />,
			},
			Education: {
				color:
					'bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100/80 active:bg-indigo-100/80 border-indigo-200/50',
				icon: <GraduationCap className="w-4 h-4" />,
			},
			Healthcare: {
				color:
					'bg-cyan-50/80 border-cyan-200/50 text-cyan-700 hover:bg-cyan-200/80 active:bg-cyan-200/80',
				icon: <Stethoscope className="w-4 h-4" />,
			},
			'Environmental Projects': {
				color:
					'bg-green-50/80 text-green-700 hover:bg-green-100/80 active:bg-green-100/80 border-green-200/50',
				icon: <Leaf className="w-4 h-4" />,
			},
			'Empowering Communities': {
				color:
					'bg-teal-50/80 text-teal-700 hover:bg-teal-100/80 active:bg-teal-100/80 border-teal-200/50',
				icon: <Rocket className="w-4 h-4" />,
			},
			'Animal Shelters': {
				color:
					'bg-rose-50/80 text-rose-700 hover:bg-rose-100/80 active:bg-rose-100/80 border-rose-200/50',
				icon: <Heart className="w-4 h-4" />,
			},
			'Community News Initiatives': {
				color:
					'bg-slate-50/80 text-slate-700 hover:bg-slate-100/80 active:bg-slate-100/80 border-slate-200/50',
				icon: <Newspaper className="w-4 h-4" />,
			},
			'Healthcare Support': {
				color:
					'bg-cyan-50/80 border-cyan-200/50 text-cyan-700 hover:bg-cyan-200/80 active:bg-cyan-200/80',
				icon: <Stethoscope className="w-4 h-4" />,
			},
			'Food Campaigns': {
				color:
					'bg-orange-50/80 border-orange-200/50 text-orange-700 hover:bg-orange-200/80 active:bg-orange-200/80',
				icon: <UtensilsCrossed className="w-4 h-4" />,
			},
			'Child Welfare Programs': {
				color:
					'bg-purple-50/80 border-purple-200/50 text-purple-700 hover:bg-purple-200/80 active:bg-purple-200/80',
				icon: <Baby className="w-4 h-4" />,
			},
			'Sustainable Agriculture': {
				color:
					'bg-sky-50/80 border-emerald-200/50 text-emerald-700 hover:bg-emerald-200/80 active:bg-emerald-200/80',
				icon: <Sprout className="w-4 h-4" />,
			},
			'Social Finance & Innovation': {
				color:
					'bg-sky-50/80 text-sky-700 hover:bg-sky-100/80 active:bg-sky-100/80 border-sky-200/50',
				icon: <Coins className="w-4 h-4" />,
			},
			'Education for All': {
				color:
					'bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100/80 active:bg-indigo-100/80 border-indigo-200/50',
				icon: <GraduationCap className="w-4 h-4" />,
			},
			'Disaster Relief Efforts': {
				color:
					'bg-red-50/80 text-red-700 hover:bg-red-100/80 active:bg-red-100/80 border-red-200/50',
				icon: <HandHelping className="w-4 h-4" />,
			},
			// Add more mappings as needed
		}

	// Default fallback
	return (
		categoryMap[category] || {
			color:
				'bg-gray-50/80 text-gray-700 hover:bg-gray-100/80 border-gray-200/50',
			icon: <LineChart className="w-4 h-4" />,
		}
	)
}

/**
 * Renders tags for a project
 */
export function RenderTags({ tags }: { tags: Tag[] | string[] }) {
	if (!Array.isArray(tags) || tags?.length === 0) return null // Prevents errors if undefined or not an array

	return (
		<div className="flex flex-wrap gap-2 mt-4">
			{tags.map((tag) => {
				const colors = getTagColors(tag)
				return (
					<span
						key={typeof tag === 'string' ? tag : tag.id}
						className="px-2 py-1 text-xs rounded uppercase"
						style={colors}
					>
						{typeof tag === 'string' ? tag : tag.text}
					</span>
				)
			})}
		</div>
	)
}

/**
 * Renders categories in badge format for a project
 */
export function RenderCategories({
	categories,
	showAllCategories = false,
}: {
	categories: string[]
	showAllCategories?: boolean
}) {
	if (!categories?.length) return null

	// If showAllCategories is false, only display the first category
	const categoriesToShow = showAllCategories ? categories : [categories[0]]

	return (
		<div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
			{categoriesToShow.map((category) => {
				const { color, icon } = getCategoryStyles(category)

				return (
					<Badge
						key={category}
						variant="secondary"
						className={`px-3 py-1.5 rounded-full ${color} shadow-sm border border-transparent`}
					>
						<span className="mr-1.5">{icon}</span>
						<span className="text-xs font-medium">{category}</span>
					</Badge>
				)
			})}
		</div>
	)
}
