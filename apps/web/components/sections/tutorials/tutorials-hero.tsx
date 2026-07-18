'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import { SectionContainer } from '~/components/shared/section-container'
import { useI18n } from '~/lib/i18n'

export function TutorialsHero() {
	const { t } = useI18n()
	const reducedMotion = useReducedMotion()

	return (
		<section
			className="relative isolate w-full overflow-hidden bg-[#fafbfc] pt-14 pb-16 sm:pt-16 sm:pb-20 md:pt-20 md:pb-24"
			aria-labelledby="tutorials-hero-title"
		>
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute inset-0 bg-grid-slate-100/60 [mask-image:radial-gradient(ellipse_at_center,white,transparent_72%)]" />
				<div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-emerald-200/35 blur-3xl" />
				<div className="absolute -left-32 top-12 h-80 w-80 rounded-full bg-indigo-200/25 blur-3xl" />
			</div>

			<SectionContainer maxWidth="6xl" className="relative">
				<motion.div
					className="mx-auto max-w-4xl text-center"
					initial={reducedMotion ? false : { opacity: 0, y: 16 }}
					animate={reducedMotion ? false : { opacity: 1, y: 0 }}
					transition={
						reducedMotion ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
					}
				>
					<p className="mb-4 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-700/80">
						<BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
						{t('tutorials.badge')}
					</p>

					<h1
						id="tutorials-hero-title"
						className="text-balance text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl"
					>
						{t('tutorials.title')}{' '}
						<span className="gradient-text">{t('tutorials.titleHighlight')}</span>
					</h1>

					<p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
						{t('tutorials.subtitle')}
					</p>
				</motion.div>
			</SectionContainer>

			<div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-white" />
		</section>
	)
}
