export type FilterType = 'category' | 'level' | 'topic'
export type LayoutType = 'grid' | 'list'

export interface ActiveFilter {
	type: FilterType
	value: string
	index: number
}
