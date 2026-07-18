'use client'

import { BookOpen, Building2, CheckCircle2, GitMerge, Landmark, UserPlus } from 'lucide-react'
import { useI18n } from '~/lib/i18n'
import { TutorialCard } from './tutorial-card'

export function TutorialsGrid() {
	const { t } = useI18n()

	const cards = [
		{
			icon: UserPlus,
			title: t('tutorials.cards.register.title'),
			description: t('tutorials.cards.register.description'),
			steps: t('tutorials.cards.register.steps') as unknown as string[],
		},
		{
			icon: BookOpen,
			title: t('tutorials.cards.createCampaign.title'),
			description: t('tutorials.cards.createCampaign.description'),
			steps: t('tutorials.cards.createCampaign.steps') as unknown as string[],
		},
		{
			icon: CheckCircle2,
			title: t('tutorials.cards.milestones.title'),
			description: t('tutorials.cards.milestones.description'),
			steps: t('tutorials.cards.milestones.steps') as unknown as string[],
		},
		{
			icon: GitMerge,
			title: t('tutorials.cards.readyForReview.title'),
			description: t('tutorials.cards.readyForReview.description'),
			steps: t('tutorials.cards.readyForReview.steps') as unknown as string[],
		},
		{
			icon: Landmark,
			title: t('tutorials.cards.donationFlow.title'),
			description: t('tutorials.cards.donationFlow.description'),
			steps: t('tutorials.cards.donationFlow.steps') as unknown as string[],
		},
		{
			icon: Building2,
			title: t('tutorials.cards.createFoundation.title'),
			description: t('tutorials.cards.createFoundation.description'),
			steps: t('tutorials.cards.createFoundation.steps') as unknown as string[],
		},
	]

	return (
		<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{cards.map((card, index) => (
				<TutorialCard key={card.title} index={index} {...card} />
			))}
		</div>
	)
}
