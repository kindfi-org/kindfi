'use client'

import { motion } from 'framer-motion'
import { CTAButtons } from '~/components/shared/cta-buttons'
import { SectionContainer } from '~/components/shared/section-container'
import { useI18n } from '~/lib/i18n'

const CallToAction = () => {
	const { t } = useI18n()

	return (
		<section
			className="relative overflow-hidden border-t border-slate-200/60 bg-white py-16 sm:py-20 lg:py-24"
			aria-labelledby="about-cta-heading"
		>
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute -right-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-emerald-100/40 blur-3xl" />
				<div className="absolute -left-24 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-indigo-100/30 blur-3xl" />
			</div>

			<SectionContainer maxWidth="4xl" className="relative text-center">
				<motion.h2
					id="about-cta-heading"
					className="text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
					viewport={{ once: true }}
				>
					<span className="gradient-text">{t('about.cta.title')}</span>
				</motion.h2>

				<motion.p
					className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:mt-8 sm:text-lg"
					initial={{ opacity: 0, y: 12 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
					viewport={{ once: true }}
				>
					{t('about.cta.subtitle')}
				</motion.p>

				<motion.div
					className="mt-10 flex justify-center sm:mt-12"
					initial={{ opacity: 0, y: 12 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
					viewport={{ once: true }}
				>
					<CTAButtons
						primaryText={t('about.cta.primary')}
						secondaryText={t('about.cta.secondary')}
						primaryHref="/projects"
						secondaryHref="/sign-up"
					/>
				</motion.div>
			</SectionContainer>
		</section>
	)
}

export { CallToAction }
