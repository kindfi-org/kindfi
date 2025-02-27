'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { CategorySelect } from '~/components/sections/community/category-select'
import type { CategoryOption } from '~/components/sections/community/category-select'
import { InvestorGrid } from '~/components/sections/community/investor-grid'
import { NoResultsMessage } from '~/components/sections/community/no-results-message'
import type { OptionSort } from '~/components/sections/community/sort-select'
import { SortSelect } from '~/components/sections/community/sort-select'
import { useFilteredAndSortedInvestors } from '~/hooks/use-filtered-and-sorted-investors'
import { fadeInUp } from '~/lib/constants/animations'

export function TopInvestors() {
	const [sortBy, setSortBy] = useState<OptionSort>('amount' as OptionSort)
	const [category, setCategory] = useState<CategoryOption>(
		'all' as CategoryOption,
	)

	const filteredAndSortedInvestors = useFilteredAndSortedInvestors(
		sortBy,
		category,
	)

	return (
		<section className="py-16 px-4 sm:px-6 lg:px-8">
			<div className="max-w-7xl mx-auto">
				<div className="flex flex-col space-y-8">
					<div className="flex justify-between items-start">
						<motion.div
							className="space-y-4"
							variants={fadeInUp}
							initial="initial"
							animate="animate"
						>
							<h2 className="text-3xl font-bold">Top kindlers</h2>
							<p className="text-muted-foreground">
								Discover the most impactful contributors driving positive
								change.
							</p>
						</motion.div>

						<div className="flex gap-4">
							<SortSelect value={sortBy} onChange={setSortBy} />
							<CategorySelect value={category} onChange={setCategory} />
						</div>
					</div>

					{filteredAndSortedInvestors.length > 0 ? (
						<InvestorGrid
							investors={filteredAndSortedInvestors}
							sortBy={sortBy}
							category={category}
						/>
					) : (
						<NoResultsMessage />
					)}
				</div>
			</div>
		</section>
	)
}
