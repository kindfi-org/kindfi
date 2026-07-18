'use client'

import { SectionContainer } from '~/components/shared/section-container'
import { useI18n } from '~/lib/i18n'
import { TutorialsCta } from './tutorials-cta'
import { TutorialsGrid } from './tutorials-grid'
import { TutorialsHero } from './tutorials-hero'

export function TutorialsContainer() {
	const { t } = useI18n()

	return (
		<>
			<TutorialsHero />

			<section
				className="w-full bg-white py-16 sm:py-20 lg:py-24"
				aria-label={t('tutorials.sections.gettingStarted')}
			>
				<SectionContainer maxWidth="7xl">
					<TutorialsGrid />
				</SectionContainer>
			</section>

			<TutorialsCta />
		</>
	)
}
