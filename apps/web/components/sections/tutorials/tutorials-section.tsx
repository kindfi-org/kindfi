'use client'

import type { TutorialSectionData } from '~/hooks/use-tutorial-sections'
import { TutorialCard } from './tutorial-card'

interface TutorialsSectionProps {
	section: TutorialSectionData
	startIndex: number
}

export const TutorialsSection = ({ section, startIndex }: TutorialsSectionProps) => {
	return (
		<section
			id={`tutorial-section-${section.id}`}
			className="scroll-mt-36"
			aria-labelledby={`tutorial-section-heading-${section.id}`}
		>
			<div className="mb-8 max-w-2xl">
				<h2
					id={`tutorial-section-heading-${section.id}`}
					className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
				>
					{section.title}
				</h2>
				<p className="mt-2 text-base leading-relaxed text-muted-foreground">
					{section.description}
				</p>
			</div>

			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{section.cards.map((card, cardIndex) => (
					<TutorialCard
						key={card.id}
						index={startIndex + cardIndex}
						id={card.id}
						icon={card.icon}
						title={card.title}
						description={card.description}
						steps={card.steps}
						href={card.href}
					/>
				))}
			</div>
		</section>
	)
}
