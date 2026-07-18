'use client'

import { SectionContainer } from '~/components/shared/section-container'
import { TutorialsCta } from './tutorials-cta'
import { TutorialsGrid } from './tutorials-grid'
import { TutorialsHero } from './tutorials-hero'
import { TutorialsSectionNav } from './tutorials-section-nav'

export const TutorialsContainer = () => {
	return (
		<>
			<TutorialsHero />

			<section className="w-full bg-white py-10 sm:py-14 lg:py-16" aria-label="Tutorial guides">
				<SectionContainer maxWidth="7xl">
					<TutorialsSectionNav />
					<div className="mt-8">
						<TutorialsGrid />
					</div>
				</SectionContainer>
			</section>

			<TutorialsCta />
		</>
	)
}
