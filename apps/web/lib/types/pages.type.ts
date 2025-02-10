import type { LucideIcon } from 'lucide-react'
import type { ConditionalRequired } from '~/lib/types'

export interface PagePropsBase {
	params?: Promise<{ [key: string]: string }>
	searchParams?: Promise<URLSearchParams>
}

export interface NavigationItem {
	href: `/${string}` | `https://${string}` | `http://${string}`
	// TODO: Title and label are overlapping, remove title...
	title?: string
	label?: string
	icon?: LucideIcon
	description?: string
}

/**
 * Represents a section of navigation items with a label.
 * @property {NavigationItem[]} items - Array of navigation items in this section
 * @property {string} label - Label for the navigation section
 */
export interface NavigationSection {
	items: NavigationItem[]
	label: string
}

export type PageProps<
	ParamsRequired extends boolean = false,
	SearchParamsRequired extends boolean = false,
> = ConditionalRequired<PagePropsBase, 'params', ParamsRequired> &
	ConditionalRequired<PagePropsBase, 'searchParams', SearchParamsRequired>
