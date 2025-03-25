'use client'
import { useCallback, useState } from 'react'
import { BsStars } from 'react-icons/bs'
import { IoMdArrowForward } from 'react-icons/io'

/**
 * Applies gradient text styling to the last two words of a title
 */
const applyGradientToLastTwoWords = (title: string) => {
	const words = title.split(' ')
	if (words.length < 2) return title

	const beforeGradient = words.slice(0, -2).join(' ')
	const gradientWords = words.slice(-2).join(' ')

	return (
		<>
			{beforeGradient}{' '}
			<span className="bg-gradient-to-l from-secondary to-primary bg-clip-text text-transparent">
				{gradientWords}
			</span>
		</>
	)
}

/**
 * Props for the HeroSection component
 */
interface HeroSectionProps {
	/** Optional title content that can include rich JSX */
	title?: React.ReactNode
	/** Optional description text */
	description?: string
	/** Optional array of CTA buttons to display */
	ctaButtons?: Array<{
		text: string
		isPrimary?: boolean
		icon?: React.ReactNode
		onClick?: () => void
	}>
	/** Optional count of learners to display */
	learnerCount?: number
	/** Optional custom slides to override default slides */
	slides?: Array<{
		title: string
		description: string
	}>
}

// Define default slides content outside the component to avoid recreating on each render
const DEFAULT_SLIDES = [
	{
		title: 'Master Blockchain for Social Impact',
		description:
			'Learn blockchain fundamentals, Stellar blockchain, and strategies for managing digital assets to create meaningful change.',
	},
	{
		title: 'Revolutionize Digital Asset Management',
		description:
			'Gain expertise in managing and leveraging digital assets for sustainable social projects.',
	},
	{
		title: 'Build Transformative Blockchain Solutions',
		description:
			'Develop innovative blockchain applications that drive positive social change.',
	},
	{
		title: 'Become a Social Impact Blockchain Leader',
		description:
			'Acquire cutting-edge skills to lead blockchain initiatives in the social impact sector.',
	},
]

const HeroSection = ({
	title = (
		<>
			Master Blockchain for{' '}
			<span className="bg-gradient-to-l from-secondary to-primary bg-clip-text text-transparent">
				Social Impact
			</span>
		</>
	),
	description = DEFAULT_SLIDES[0].description,
	ctaButtons = [],
	learnerCount = 2500,
	slides: customSlides,
}: HeroSectionProps) => {
	// active button state
	const [activeButton, setActiveButton] = useState<number>(1)

	// Use custom slides if provided, otherwise use default slides
	const slides = customSlides || DEFAULT_SLIDES

	// Determine the title to display with gradient
  const currentSlide = slides[activeButton - 1];
	const currentTitle = currentSlide.title;
	const displayTitle = typeof currentTitle === 'string' 
		? applyGradientToLastTwoWords(currentTitle)
		: currentTitle;
    
	// Determine the description to display
	const displayDescription =
		slides[activeButton - 1]?.description || description

	// handle button click
	const handleButtonClick = useCallback((buttonNumber: number): void => {
		setActiveButton(buttonNumber)
	}, [])

	return (
		// hero section
		<div className="bg-stone-100 text-center min-h-screen flex items-center px-4 sm:px-6">
			<div className="w-full md:w-3/4 lg:w-1/2 mx-auto">
				<div>
					<p className="bg-stone-200 text-primary p-2 rounded-lg inline-flex items-center text-xs">
						<BsStars className="inline mr-1" /> KindFi's Education Platform
					</p>
					<h1 className="text-gray-900 text-3xl sm:text-4xl lg:text-5xl font-bold mt-6">
						{displayTitle}
					</h1>
					<p className="text-secondary mt-3 sm:mt-4 text-sm sm:text-base">
						{displayDescription}
					</p>

					{/* call to action home buttons */}
					<div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 justify-center">
						<button
							className="bg-gradient-to-l from-secondary to-primary shadow px-4 sm:px-5 py-2 rounded-md flex items-center justify-center gap-2 text-white hover:opacity-90 focus:ring-2 focus:ring-lime-300 focus:outline-none transition-all"
							type="button"
							aria-label="Start Your Journey"
						>
							Start Your Journey
							<IoMdArrowForward className="inline" />
						</button>
						<button
							className="border border-slate-400 shadow px-4 sm:px-5 py-2 rounded-md text-[#4B5563] mt-3 sm:mt-0 hover:bg-gray-50 focus:ring-2 focus:ring-gray-300 focus:outline-none transition-all"
							type="button"
							aria-label="Try Passkey Login"
						>
							Try Passkey Login
						</button>
					</div>
				</div>

				{/* pagination buttons */}
				<div className="flex flex-col sm:flex-row gap-3 w-full sm:w-3/4 md:w-1/2 mx-auto mt-8 sm:mt-10 text-xs sm:text-sm justify-center items-center">
					<div className="flex gap-2 mb-3 sm:mb-0">
            {Array.from({ length: slides.length }, (_, i) => i + 1).map((num) => (
							<button
								key={num}
								onClick={() => handleButtonClick(num)}
								onKeyDown={(e) => {
									if (e.key === 'ArrowRight' && num < 4) {
										handleButtonClick(num + 1)
									} else if (e.key === 'ArrowLeft' && num > 1) {
										handleButtonClick(num - 1)
									}
								}}
								type="button"
								className={`h-6 w-6 flex items-center justify-center rounded transition-all duration-300 ${
									activeButton === num
										? 'bg-primary text-white'
										: 'bg-stone-200 text-secondary hover:bg-stone-300'
								}`}
								aria-label={`Go to slide ${num}`}
								aria-current={activeButton === num ? 'true' : 'false'}
							>
								{num}
							</button>
						))}
					</div>
					<p className="text-secondary text-xs">
            Join<span className="font-semibold">{learnerCount.toLocaleString()}+</span>learners
						worldwide
					</p>
				</div>
			</div>
		</div>
	)
}

export default HeroSection
