'use client'

import Link from 'next/link'
import { forwardRef, memo } from 'react'
import { Card } from '~/components/base/card'
import { Icon } from '~/components/ui/icon'

/**
 * LearningPathsCard component renders a card displaying information about a learning path.
 * It includes an icon, title, description, and a call-to-action button to start the learning path.
 *
 * @param {object} props - The properties for the component.
 * @param {string} props.icon - The icon name to display on the card.
 * @param {string} props.title - The title of the learning path.
 * @param {string} props.description - A short description of the learning path.
 * @param {number} props.modules - The number of modules in the learning path.
 * @param {string} props.level - The difficulty level of the learning path.
 * @param {string} props.duration - The estimated duration of the learning path.
 * @param {string} props.cta - The URL or path for the call-to-action button (e.g., where to start the path).
 * @param {"green" | "blue"} props.ctaColor - The color theme of the call-to-action button (green or blue).
 */

type LearningPathIconName = 'table2' | 'zap'
type LearningPathLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels'
type LearningPathDuration = '2 weeks' | '3 weeks' | '4 weeks'
type LearningPathCTAColor = 'green' | 'blue'

export interface LearningPathCardProps {
	icon: LearningPathIconName
	title: string
	description: string
	modules: number
	level: LearningPathLevel
	duration: LearningPathDuration
	cta: string
	ctaColor?: LearningPathCTAColor
}

const LearningPathsCard = forwardRef<HTMLDivElement, LearningPathCardProps>(
	(
		{ icon, title, description, modules, level, duration, cta, ctaColor },
		ref,
	) => {
		return (
			<Card
				ref={ref}
				className="flex flex-col items-start p-4 space-y-6 transition-all duration-200 bg-white shadow-lg hover:bg-gray-50 hover:-mt-1 lg:p-6 group"
			>
				<div
					aria-hidden="true"
					className={`${ctaColor === 'green' ? 'bg-green-100/50 text-green-600  group-hover:bg-green-100' : 'bg-blue-100/50 text-blue-600  group-hover:bg-blue-100'} p-3 rounded-full transition-all duration-200`}
				>
					<Icon name={icon} className="w-6 h-6" />{' '}
					{/* Using the new Icon component */}
				</div>
				<div className="flex-1 space-y-6">
					<h2
						className={`${ctaColor === 'green' ? 'text-green-600' : 'text-blue-500'} text-2xl font-bold mb-2`}
					>
						{title}
					</h2>
					<p className="text-muted-foreground text-sm !-mt-0.5">
						{description}
					</p>
					<div
						aria-label="Learning Path Details"
						className="flex flex-wrap gap-4 mb-4 text-sm text-gray-500"
					>
						<span
							className="px-2 py-1 bg-gray-100 rounded-full"
							aria-label={`${modules} modules`}
						>
							{modules} Modules
						</span>
						<span
							aria-label={`Level: ${level}`}
							className="px-2 py-1 bg-gray-100 rounded-full"
						>
							{level}
						</span>
						<span
							aria-label={`Duration: ${duration}`}
							className="px-2 py-1 bg-gray-100 rounded-full"
						>
							{duration}
						</span>
					</div>

					<Link
						href={cta}
						aria-label={`Start learning path: ${title}`}
						className="flex mt-4"
					>
						{/* biome-ignore lint/a11y/useButtonType: <explanation> */}
						<button
							className={`w-full py-3 rounded-md text-white font-medium ${
								ctaColor === 'green'
									? 'bg-gradient-to-r from-green-400 to-black'
									: 'bg-blue-500'
							}`}
						>
							Start This Path ➔
						</button>
					</Link>
				</div>
			</Card>
		)
	},
)

LearningPathsCard.displayName = 'LearningPathsCard'

const MemoizedLearningPathsCard = memo(LearningPathsCard)

export { MemoizedLearningPathsCard as LearningPathsCard }
