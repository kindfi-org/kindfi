'use client'

import { useI18n } from '~/lib/i18n'

export function ProjectsHeader() {
	const { t } = useI18n()

	return (
		<header className="mb-6" aria-label="Projects page header">
			<h1
				id="projects-page-title"
				className="text-4xl md:text-5xl font-bold mb-4 py-2 sm:text-center gradient-text text-balance"
			>
				{t('projects.pageTitle')}
			</h1>
		</header>
	)
}
