'use client'

import Link from 'next/link'
import { forwardRef } from 'react'
import { Card } from '~/components/base/card'
import { Icon } from '~/components/ui/icon'

interface LearningPathCardProps {
	icon: string
	title: string
	description: string
	modules: number
	level: string
	duration: string
	cta: string
	ctaColor: 'green' | 'blue'
}

const LearningPathsCard = forwardRef<HTMLDivElement, LearningPathCardProps>(
	(
		{ icon, title, description, modules, level, duration, cta, ctaColor },
		ref,
	) => {
		return (
			<Card
				ref={ref}
				className="bg-white hover:bg-gray-50 hover:-mt-1 lg:p-6 p-4 flex flex-col items-start space-y-6 shadow-lg transition-all duration-200 group"
			>
				<div
					className={`${ctaColor === 'green' ? 'bg-green-100/50 text-green-600  group-hover:bg-green-100' : 'bg-blue-100/50 text-blue-600  group-hover:bg-blue-100'} p-3 rounded-full transition-all duration-200`}
				>
					<Icon name={icon} className="h-6 w-6" />{' '}
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
					<div className="flex flex-wrap text-sm text-gray-500 gap-4 mb-4">
						<span className="px-2 py-1 bg-gray-100 rounded-full">
							{modules} Modules
						</span>
						<span className="px-2 py-1 bg-gray-100 rounded-full">{level}</span>
						<span className="px-2 py-1 bg-gray-100 rounded-full">
							{duration}
						</span>
					</div>

					<Link href={cta} className="mt-4 flex">
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
export { LearningPathsCard }
