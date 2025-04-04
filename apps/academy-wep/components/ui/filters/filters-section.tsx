'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ActiveFilter, LayoutType } from '~/lib/types/filters.types'
import { Input } from '../../base/input'
import { CategoryFilter } from './category-filter'
import { FilterButton } from './filter-button'
import { LevelFilter } from './level-filter'
import { PopularTopics } from './popular-topics'
import { ResetButton } from './reset-button'

export function FiltersSection() {
	const categories = useMemo(
		() => ['All', 'Blockchain', 'Stellar', 'Web3', 'KindFi'],
		[],
	)
	const levels = useMemo(
		() => ['All Levels', 'Beginner', 'Intermediate', 'Advanced'],
		[],
	)
	const topics = useMemo(() => ['Blockchain', 'Stellar', 'Wallets', 'Web3'], [])

	const [selectedCategory, setSelectedCategory] = useState(0)
	const [selectedLevel, setSelectedLevel] = useState(0)
	const [selectedTopic, setSelectedTopic] = useState(-1)
	const [searchQuery, setSearchQuery] = useState('')
	const [showFilters, setShowFilters] = useState(false)
	const [currentLayout, setCurrentLayout] = useState<LayoutType>('grid')
	const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])

	const removeFilter = useCallback((filter: ActiveFilter) => {
		if (filter.type === 'category') {
			setSelectedCategory(0)
		} else if (filter.type === 'level') {
			setSelectedLevel(0)
		} else if (filter.type === 'topic') {
			setSelectedTopic(-1)
		}
	}, [])

	useEffect(() => {
		const newFilters: ActiveFilter[] = []

		if (selectedCategory > 0) {
			newFilters.push({
				type: 'category' as const,
				value: categories[selectedCategory],
				index: selectedCategory,
			})
		}

		if (selectedLevel > 0) {
			newFilters.push({
				type: 'level' as const,
				value: levels[selectedLevel],
				index: selectedLevel,
			})
		}

		if (selectedTopic >= 0) {
			newFilters.push({
				type: 'topic' as const,
				value: topics[selectedTopic],
				index: selectedTopic,
			})
		}

		// Compare arrays to avoid unnecessary updates
		if (JSON.stringify(newFilters) !== JSON.stringify(activeFilters)) {
			setActiveFilters(newFilters)
		}
	}, [
		selectedCategory,
		selectedLevel,
		selectedTopic,
		activeFilters,
		categories,
		levels,
		topics,
	])

	const handleReset = () => {
		// Add a slight delay to make the animation visible
		setTimeout(() => {
			setSelectedCategory(0)
			setSelectedLevel(0)
			setSelectedTopic(-1)
			setSearchQuery('')
			setActiveFilters([])
		}, 300) // 300ms delay for the animation to be visible
	}

	const toggleFilters = useCallback(() => {
		setShowFilters((prev) => !prev)
	}, [])

	const handleLayoutChange = useCallback((layout: LayoutType) => {
		setCurrentLayout(layout)
	}, [])

	const handleTopicSelect = useCallback(
		(topic: string, index: number) => {
			setSelectedTopic(selectedTopic === index ? -1 : index)
		},
		[selectedTopic],
	)

	return (
		<div
			className="flex p-6 flex-col w-full h-auto shadow-gray-300 rounded-md bg-white"
			style={{ boxShadow: '0 0 3px 1px rgba(0, 0, 0, 0.1)' }}
		>
			<div className="w-full h-auto flex lg:flex-row flex-col gap-3">
				<div className="relative w-full lg:max-w-72 h-auto">
					<Input
						type="search"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search modules and resources..."
						className="bg-transparent relative border max-w-lg h-12 py-2 border-zinc-300 text-foreground pl-10 placeholder-muted-foreground focus:ring-primary-500 rounded-md flex items-center"
						aria-label="Search modules and resources"
					/>
					<Search className="w-6 h-6 text-zinc-400 absolute top-1/2 transform -translate-y-1/2 left-2.5" />
				</div>
				<div className="w-full items-end justify-center lg:justify-end flex flex-row">
					<FilterButton
						onFilterClick={toggleFilters}
						currentLayout={currentLayout}
						onLayoutChange={handleLayoutChange}
						isExpanded={showFilters}
					/>
				</div>
			</div>

			<AnimatePresence initial={false}>
				{showFilters && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.3 }}
						className="w-full overflow-hidden"
					>
						<div className="w-full border-t border-zinc-100 h-auto mt-6">
							<div className="lg:flex-row flex-col items-start justify-between py-6 flex gap-8">
								<div className="w-full lg:w-auto">
									<CategoryFilter
										categories={categories}
										selected={selectedCategory}
										setSelected={setSelectedCategory}
									/>
								</div>

								<div className="w-full lg:w-auto">
									<LevelFilter
										levels={levels}
										selected={selectedLevel}
										setSelected={setSelectedLevel}
									/>
								</div>

								<div className="w-full lg:w-auto">
									<PopularTopics
										topics={topics}
										selected={selectedTopic}
										onTopicSelect={handleTopicSelect}
									/>
								</div>
							</div>

							<div className="w-full mt-6">
								<ResetButton
									onReset={handleReset}
									activeFilters={activeFilters}
									removeFilter={removeFilter}
								/>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
