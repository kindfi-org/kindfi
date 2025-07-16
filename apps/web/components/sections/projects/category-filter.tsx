import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Badge } from '~/components/base/badge'
import { getCategoryStyles } from '~/lib/utils/categories-util'

//? Extract the categories from the categoryMap in categories-util.tsx
const categories = [
	'Animal Welfare',
	'Child Welfare',
	'Environmental Protection',
	'Disaster Relief',
	'Culture and Arts',
	'Access to Clean Water',
	'Education',
	'Healthcare',
	'Environmental Projects',
	'Empowering Communities',
	'Animal Shelters',
	'Community News Initiatives',
	'Healthcare Support',
	'Food Campaigns',
	'Child Welfare Programs',
	'Sustainable Agriculture',
	'Social Finance & Innovation',
	'Education for All',
	'Disaster Relief Efforts',
]

interface CategoryFilterProps {
	selectedCategories: string[]
	onCategoryToggle: (category: string) => void
}

export function CategoryFilter({
	selectedCategories,
	onCategoryToggle,
}: CategoryFilterProps) {
	const scrollContainerRef = useRef<HTMLDivElement>(null)
	const scrollTrackRef = useRef<HTMLDivElement>(null)
	const scrollThumbRef = useRef<HTMLDivElement>(null)
	const [isDragging, setIsDragging] = useState(false)
	const [startX, setStartX] = useState(0)
	const [scrollStartLeft, setScrollStartLeft] = useState(0)
	const [thumbWidth, setThumbWidth] = useState(40)
	const [hasOverflow, setHasOverflow] = useState(false)

	// DEBUG: Log selected categories to see what's being tracked
	useEffect(() => {
		console.log('Selected Categories:', selectedCategories)
	}, [selectedCategories])

	// Calculate how far right the thumb can go
	const getMaxThumbPosition = () => {
		const trackWidth = scrollTrackRef.current?.clientWidth || 0
		return trackWidth - thumbWidth
	}

	// Calculate appropriate thumb width based on content
	const updateThumbSize = () => {
		const container = scrollContainerRef.current
		const track = scrollTrackRef.current

		if (!container || !track) return

		const containerWidth = container.clientWidth
		const contentWidth = container.scrollWidth
		const trackWidth = track.clientWidth

		// Check if we need to show scroll UI
		const overflow = contentWidth > containerWidth
		setHasOverflow(overflow)

		if (!overflow) return

		// Calculate thumb width proportionally (with minimum size)
		const ratio = containerWidth / contentWidth
		const calculatedWidth = Math.max(40, trackWidth * ratio)
		setThumbWidth(calculatedWidth)
	}

	// Update thumb position as scrolling happens
	const updateThumbPosition = () => {
		const container = scrollContainerRef.current
		const thumb = scrollThumbRef.current
		const track = scrollTrackRef.current

		if (!container || !thumb || !track) return

		const scrollRatio =
			container.scrollLeft / (container.scrollWidth - container.clientWidth)
		const maxThumbPosition = getMaxThumbPosition()
		const thumbPosition = scrollRatio * maxThumbPosition

		thumb.style.transform = `translateX(${thumbPosition}px)`
	}

	// Handle scroll events
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const container = scrollContainerRef.current
		if (!container) return

		const handleScroll = () => {
			updateThumbPosition()
		}

		container.addEventListener('scroll', handleScroll)
		window.addEventListener('resize', updateThumbSize)

		// Initial calculations
		updateThumbSize()
		updateThumbPosition()

		return () => {
			container.removeEventListener('scroll', handleScroll)
			window.removeEventListener('resize', updateThumbSize)
		}
	}, [])

	// Handle thumb drag start
	const handleThumbMouseDown = (e: React.MouseEvent) => {
		e.preventDefault()
		setIsDragging(true)
		setStartX(e.clientX)

		const container = scrollContainerRef.current
		if (container) {
			setScrollStartLeft(container.scrollLeft)
		}
	}

	// Handle thumb dragging
	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (!isDragging) return

			const container = scrollContainerRef.current
			const track = scrollTrackRef.current
			if (!container || !track) return

			const deltaX = e.clientX - startX
			const trackWidth = track.clientWidth
			const contentWidth = container.scrollWidth

			// Calculate how much to scroll based on thumb movement
			const scrollRatio =
				(contentWidth - container.clientWidth) / (trackWidth - thumbWidth)
			const newScrollLeft = scrollStartLeft + deltaX * scrollRatio

			container.scrollLeft = newScrollLeft
		}

		const handleMouseUp = () => {
			setIsDragging(false)
		}

		if (isDragging) {
			window.addEventListener('mousemove', handleMouseMove)
			window.addEventListener('mouseup', handleMouseUp)
		}

		return () => {
			window.removeEventListener('mousemove', handleMouseMove)
			window.removeEventListener('mouseup', handleMouseUp)
		}
	}, [isDragging, startX, scrollStartLeft, thumbWidth])

	// Check if a category is selected - fixed to be truly case-insensitive
	const isCategorySelected = (category: string) => {
		// Debug this comparison
		const isSelected = selectedCategories.some(
			(selected) => selected.toLowerCase() === category.toLowerCase(),
		)
		console.log(`Category: ${category}, Selected: ${isSelected}`)
		return isSelected
	}

	return (
		<div className="relative w-full">
			{/* Selected categories display for better visibility */}
			{selectedCategories.length > 0 && (
				<div className="mb-3 flex flex-wrap gap-2">
					<span className="text-sm font-medium text-gray-700">Selected:</span>
					{selectedCategories.map((category) => (
						<Badge
							key={`selected-${category}`}
							variant="secondary"
							className="bg-primary-100 text-primary-700 px-2 py-1 flex items-center gap-1"
						>
							{category}
							<X
								className="h-3 w-3 cursor-pointer"
								onClick={() => onCategoryToggle(category)}
							/>
						</Badge>
					))}
				</div>
			)}

			<div
				ref={scrollContainerRef}
				className="flex overflow-x-auto py-2 px-2 gap-3 items-center scroll-smooth mb-2"
				style={{
					scrollbarWidth: 'none',
					msOverflowStyle: 'none',
					WebkitOverflowScrolling: 'touch',
				}}
			>
				{categories.map((category) => {
					const { color, icon } = getCategoryStyles(category)
					const isSelected = isCategorySelected(category)

					return (
						<motion.div
							key={category}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className="flex-shrink-0"
						>
							<Badge
								variant="secondary"
								className={`px-3 py-1.5 rounded-full shadow-sm border border-transparent transition-all ${
									isSelected
										? `${color} shadow-md ring-1 ring-blue-500`
										: `bg-gray-100 text-gray-600 hover:${color}`
								}`}
								onClick={() => {
									console.log(`Clicked: ${category}`)
									onCategoryToggle(category)
								}}
								aria-pressed={isSelected}
							>
								<span className="mr-1.5">{icon}</span>
								<span className="text-xs font-medium whitespace-nowrap">
									{category}
								</span>
							</Badge>
						</motion.div>
					)
				})}
			</div>

			{/* Custom scrollbar track */}
			{hasOverflow && (
				<div
					ref={scrollTrackRef}
					className="h-1 bg-gray-100 rounded-full mx-auto w-1/3 mt-1"
				>
					{/* Custom scrollbar thumb */}
					<motion.div
						ref={scrollThumbRef}
						className="h-1 bg-gray-400 rounded-full cursor-pointer hover:bg-primary-200"
						initial={{ width: thumbWidth }}
						animate={{
							width: thumbWidth,
							backgroundColor: isDragging ? 'var(--primary-500)' : undefined,
						}}
						style={{
							width: thumbWidth,
							willChange: 'transform',
						}}
						onMouseDown={handleThumbMouseDown}
						whileHover={{ height: 4, marginTop: -1.5 }}
						transition={{ duration: 0.2 }}
					/>
				</div>
			)}
		</div>
	)
}
