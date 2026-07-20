'use client'

import { useMemo } from 'react'
import {
	TUTORIAL_CARDS,
	TUTORIAL_SECTION_ORDER,
	type TutorialCardId,
	type TutorialSectionId,
} from '~/lib/constants/tutorials-data'
import { useI18n } from '~/lib/i18n'

export interface TutorialCardData {
	id: TutorialCardId
	icon: (typeof TUTORIAL_CARDS)[number]['icon']
	title: string
	description: string
	steps: string[]
	href?: string
}

export interface TutorialSectionData {
	id: TutorialSectionId
	title: string
	description: string
	cards: TutorialCardData[]
}

export const useTutorialSections = (): TutorialSectionData[] => {
	const { t, tArray } = useI18n()

	return useMemo(
		() =>
			TUTORIAL_SECTION_ORDER.map((sectionId) => ({
				id: sectionId,
				title: t(`tutorials.sections.${sectionId}`),
				description: t(`tutorials.sectionDescriptions.${sectionId}`),
				cards: TUTORIAL_CARDS.filter((card) => card.section === sectionId).map((card) => ({
					id: card.id,
					icon: card.icon,
					title: t(`tutorials.cards.${card.id}.title`),
					description: t(`tutorials.cards.${card.id}.description`),
					steps: tArray(`tutorials.cards.${card.id}.steps`),
					href: card.href,
				})),
			})),
		[t, tArray],
	)
}
