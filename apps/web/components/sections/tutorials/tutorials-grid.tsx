'use client'

import { useTutorialSections } from '~/hooks/use-tutorial-sections'
import { TutorialsSection } from './tutorials-section'

export const TutorialsGrid = () => {
	const sections = useTutorialSections()

	let cardOffset = 0

	return (
		<div className="space-y-16 sm:space-y-20">
			{sections.map((section) => {
				const startIndex = cardOffset
				cardOffset += section.cards.length

				return <TutorialsSection key={section.id} section={section} startIndex={startIndex} />
			})}
		</div>
	)
}
