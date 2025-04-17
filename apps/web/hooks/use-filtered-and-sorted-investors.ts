'use client'

import { useMemo } from 'react'
import { investorsData } from '~/lib/mock-data/community-top-investors-data'
import { safeParseFloat } from '~/lib/utils/safe-parse-float'

export const useFilteredAndSortedInvestors = (
	sortBy: string,
	category: string,
) => {
	return useMemo(() => {
		let filtered = investorsData

		if (category !== 'all') {
			filtered = filtered.filter((investor) =>
				investor.categories.some((cat) => cat.name.toLowerCase() === category),
			)
		}

		return [...filtered].sort((a, b) => {
			switch (sortBy) {
				case 'amount':
					return safeParseFloat(b.totalImpact) - safeParseFloat(a.totalImpact)
				case 'projects':
					return b.projectsSupported - a.projectsSupported
				case 'followers':
					return b.followers - a.followers
				default:
					return 0
			}
		})
	}, [sortBy, category])
}
