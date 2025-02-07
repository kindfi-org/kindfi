export const SORT_OPTIONS = {
	popular: 'Popular Searches',
	recent: 'Most Recent',
	funded: 'Most Funded',
} as const

export type SortOption = keyof typeof SORT_OPTIONS
