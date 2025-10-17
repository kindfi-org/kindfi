'use client'

import { useI18n } from '~/lib/i18n'

export function ProjectsHeader() {
	const { t } = useI18n()

	return (
		<div className="mb-6">
			<h1 className="text-4xl md:text-5xl font-bold mb-4 py-2 sm:text-center gradient-text">
				{t("projects.pageTitle")}
			</h1>
		</div>
	)
}