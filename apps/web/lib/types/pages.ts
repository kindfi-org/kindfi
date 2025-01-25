import type { ReactNode } from 'react'
import type { ConditionalRequired } from '~/lib/types'

export interface PagePropsBase {
	params?: Promise<{ [key: string]: string }>
	searchParams?: Promise<URLSearchParams>
}

export interface NavigationItem {
	title: string
	href: string
	description?: string
}

export interface NavigationSection {
	items: NavigationItem[]
	label: string
}

export type PageProps<
	ParamsRequired extends boolean = false,
	SearchParamsRequired extends boolean = false,
> = ConditionalRequired<PagePropsBase, 'params', ParamsRequired> &
	ConditionalRequired<PagePropsBase, 'searchParams', SearchParamsRequired>
