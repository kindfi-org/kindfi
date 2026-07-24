'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { IoAddOutline } from 'react-icons/io5'
import { Button } from '~/components/base/button'
import { ProjectHighlightCard } from '~/components/sections/project/highlights/project-highlight-card'
import { useContentWizard } from '~/hooks/contexts/use-content-wizard.context'
import { useI18n } from '~/lib/i18n/context'
import type { ContentWizardHighlight } from '~/lib/types/project/content-wizard.types'
import { generateUniqueId } from '~/lib/utils/id'
import { WizardStepShell } from '../wizard-step-shell'

const MIN_HIGHLIGHTS = 2

const createDefaultHighlights = (prefix: string): ContentWizardHighlight[] => [
	{ id: generateUniqueId(`${prefix}-`), title: '', description: '' },
	{ id: generateUniqueId(`${prefix}-`), title: '', description: '' },
]

type WizardHighlightsStepProps = {
	variant: 'primary' | 'translation'
	onContinue: (highlights: ContentWizardHighlight[]) => void | Promise<void>
	onBack: () => void
	onSaveLater?: () => void
	isSaving?: boolean
}

export function WizardHighlightsStep({
	variant,
	onContinue,
	onBack,
	onSaveLater,
	isSaving = false,
}: WizardHighlightsStepProps) {
	const { t } = useI18n()
	const prefersReducedMotion = useReducedMotion()
	const { formData } = useContentWizard()
	const isTranslation = variant === 'translation'

	const [highlights, setHighlights] = useState<ContentWizardHighlight[]>(() => {
		if (isTranslation) {
			return formData.translationHighlights.length >= MIN_HIGHLIGHTS
				? formData.translationHighlights
				: (formData.highlights.length >= MIN_HIGHLIGHTS
						? formData.highlights
						: createDefaultHighlights('translation-highlight')
					).map(() => ({
						id: generateUniqueId('translation-highlight-'),
						title: '',
						description: '',
					}))
		}
		return formData.highlights.length >= MIN_HIGHLIGHTS
			? formData.highlights
			: createDefaultHighlights('highlight')
	})

	useEffect(() => {
		if (isTranslation && formData.translationHighlights.length >= MIN_HIGHLIGHTS) {
			setHighlights(formData.translationHighlights)
		}
		if (!isTranslation && formData.highlights.length >= MIN_HIGHLIGHTS) {
			setHighlights(formData.highlights)
		}
	}, [formData.highlights, formData.translationHighlights, isTranslation])

	const handleChange = (id: string, field: 'title' | 'description', value: string) => {
		setHighlights((items) => items.map((h) => (h.id === id ? { ...h, [field]: value } : h)))
	}

	const addHighlight = () => {
		setHighlights((items) => [
			...items,
			{
				id: generateUniqueId(isTranslation ? 'translation-highlight-' : 'highlight-'),
				title: '',
				description: '',
			},
		])
	}

	const removeHighlight = (id: string) => {
		setHighlights((items) => items.filter((h) => h.id !== id))
	}

	const isValid =
		highlights.length >= MIN_HIGHLIGHTS &&
		highlights.every((h) => h.title.trim() && h.description.trim())

	const oppositeLabel = (formData.sourceLocale ?? 'en') === 'en' ? 'Spanish' : 'English'

	return (
		<WizardStepShell
			title={
				isTranslation
					? t('projects.manage.contentWizard.translationPhaseTitle').replace(
							'{language}',
							oppositeLabel,
						)
					: t('projects.manage.contentWizard.stepHighlights')
			}
			description={
				isTranslation
					? t('projects.manage.contentWizard.translationPhaseDescription').replace(
							'{language}',
							oppositeLabel,
						)
					: t('projects.manage.translationSectionDescription')
			}
			onBack={onBack}
			onContinue={() => onContinue(highlights)}
			onSaveLater={onSaveLater}
			showSaveLater={Boolean(onSaveLater) && isTranslation}
			isContinueDisabled={!isValid}
			isSaving={isSaving}
		>
			{isTranslation ? (
				<div className="space-y-3 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
					<p className="font-medium text-foreground">
						{t('projects.manage.contentWizard.sourcePreview')}
					</p>
					{formData.highlights.map((highlight, index) => (
						<div key={highlight.id} className="rounded-md border bg-background p-3">
							<p className="font-medium text-foreground">
								{index + 1}. {highlight.title}
							</p>
							<p className="mt-1">{highlight.description}</p>
						</div>
					))}
				</div>
			) : null}

			<motion.div layout className="space-y-6">
				{highlights.map((highlight, index) => (
					<motion.div
						key={highlight.id}
						layout
						initial={{ opacity: 0, scale: 0.98 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
					>
						<ProjectHighlightCard
							{...highlight}
							index={index + 1}
							showDelete={highlights.length > MIN_HIGHLIGHTS}
							onChange={handleChange}
							onDelete={() => removeHighlight(highlight.id)}
						/>
					</motion.div>
				))}
			</motion.div>

			<Button
				type="button"
				variant="outline"
				className="w-full"
				onClick={addHighlight}
				startIcon={<IoAddOutline />}
			>
				Add another impact point
			</Button>
		</WizardStepShell>
	)
}
