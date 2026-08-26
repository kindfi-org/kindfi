'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { IoChevronForwardOutline } from 'react-icons/io5'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/base/card'
import { useContentWizardValidation } from '~/components/sections/projects/content-wizard/hooks/use-content-wizard-validation'
import { useManagedProjectQuery } from '~/hooks/projects/use-managed-project-query'
import { useI18n } from '~/lib/i18n/context'
import type { getBasicProjectInfoBySlug } from '~/lib/queries/projects/get-basic-project-info-by-slug'
import type { getProjectHighlights } from '~/lib/queries/projects/get-project-highlights'
import type { getProjectPitchDataBySlug } from '~/lib/queries/projects/get-project-pitch-data-by-slug'
import {
	initialContentWizardFormData,
	type TranslationSectionStatus,
} from '~/lib/types/project/content-wizard.types'
import { buildContentWizardFormData } from '~/lib/utils/build-content-wizard-form-data'

type TranslationProgressCardProps = {
	slug: string
}

const statusLabel = (status: TranslationSectionStatus, t: (key: string) => string) => {
	switch (status) {
		case 'complete':
			return t('projects.manage.contentWizard.statusComplete')
		case 'partial':
			return t('projects.manage.contentWizard.statusInProgress')
		default:
			return t('projects.manage.contentWizard.statusNotStarted')
	}
}

export function TranslationProgressCard({ slug }: TranslationProgressCardProps) {
	const { t } = useI18n()

	const { data: project } = useManagedProjectQuery<
		Awaited<ReturnType<typeof getBasicProjectInfoBySlug>>
	>('basic-project-info', slug, 'basic-info', { additionalKeyValues: [slug] })

	const { data: pitchData } = useManagedProjectQuery<
		Awaited<ReturnType<typeof getProjectPitchDataBySlug>>
	>('project-pitch', slug, 'pitch', { additionalKeyValues: [slug] })

	const { data: highlights } = useManagedProjectQuery<
		Awaited<ReturnType<typeof getProjectHighlights>>
	>('project-highlights', slug, 'highlights', { additionalKeyValues: [slug] })

	const formData = useMemo(() => {
		if (!project) return initialContentWizardFormData('en')

		return buildContentWizardFormData({
			project,
			pitch: pitchData?.pitch ?? null,
			highlights: highlights ?? null,
		})
	}, [project, pitchData, highlights])

	const { translationStatus } = useContentWizardValidation(formData)

	if (!project) return null

	return (
		<Card className="border-border/80">
			<CardHeader>
				<CardTitle>{t('projects.manage.contentWizard.translationProgress')}</CardTitle>
				<CardDescription>
					{t('projects.manage.contentWizard.translationProgressDescription')}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<p className="text-2xl font-semibold tabular-nums">{translationStatus.overallPercent}%</p>
				<div className="flex flex-wrap gap-2">
					<Badge variant="outline">
						{t('projects.manage.contentWizard.stepBasics')}:{' '}
						{statusLabel(translationStatus.basics, t)}
					</Badge>
					<Badge variant="outline">
						{t('projects.manage.contentWizard.stepStory')}:{' '}
						{statusLabel(translationStatus.story, t)}
					</Badge>
					<Badge variant="outline">
						{t('projects.manage.contentWizard.stepHighlights')}:{' '}
						{statusLabel(translationStatus.highlights, t)}
					</Badge>
				</div>
				<Link href={`/projects/${slug}/manage/content`}>
					<Button
						variant="outline"
						className="w-full sm:w-auto"
						endIcon={<IoChevronForwardOutline aria-hidden="true" />}
					>
						{t('projects.manage.contentWizard.editContent')}
					</Button>
				</Link>
			</CardContent>
		</Card>
	)
}
