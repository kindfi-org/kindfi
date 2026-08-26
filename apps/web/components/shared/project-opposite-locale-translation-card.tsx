'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/base/card'
import { useI18n } from '~/lib/i18n/context'
import { getOppositeLocale, type SupportedLocale } from '~/lib/schemas/locale.schemas'

type ProjectOppositeLocaleTranslationCardProps = {
	sourceLocale: SupportedLocale
	children: React.ReactNode
}

export const ProjectOppositeLocaleTranslationCard = ({
	sourceLocale,
	children,
}: ProjectOppositeLocaleTranslationCardProps) => {
	const { t } = useI18n()
	const oppositeLocale = getOppositeLocale(sourceLocale)
	const titleKey =
		oppositeLocale === 'en'
			? 'projects.manage.translationSectionTitleEn'
			: 'projects.manage.translationSectionTitleEs'

	return (
		<Card className="border-dashed">
			<CardHeader className="pb-4">
				<CardTitle className="text-lg">{t(titleKey)}</CardTitle>
				<CardDescription>{t('projects.manage.translationSectionDescription')}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">{children}</CardContent>
		</Card>
	)
}
