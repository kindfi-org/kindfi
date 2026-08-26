'use client'

import { TUTORIAL_SECTION_ORDER } from '~/lib/constants/tutorials-data'
import { useI18n } from '~/lib/i18n'
import { cn } from '~/lib/utils'

export const TutorialsSectionNav = () => {
	const { t } = useI18n()

	return (
		<nav
			className="sticky top-16 z-20 -mx-4 border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
			aria-label={t('tutorials.nav.label')}
		>
			<div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				{TUTORIAL_SECTION_ORDER.map((sectionId) => (
					<a
						key={sectionId}
						href={`#tutorial-section-${sectionId}`}
						className={cn(
							'inline-flex shrink-0 items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800',
						)}
					>
						{t(`tutorials.sections.${sectionId}`)}
					</a>
				))}
			</div>
		</nav>
	)
}
