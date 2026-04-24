'use client'

import { motion } from 'framer-motion'
import { CTAButtons } from '~/components/shared/cta-buttons'
import { SectionContainer } from '~/components/shared/section-container'
import { useI18n } from '~/lib/i18n'

const CallToAction = () => {
	const { t } = useI18n()

	return (
		<section
			className="relative overflow-hidden bg-gradient-to-b from-muted/40 via-background to-background py-16 sm:py-20 lg:py-24"
			aria-labelledby="about-cta-heading"
		>
			<SectionContainer maxWidth="4xl" className="text-center">
				<motion.h2
					id="about-cta-heading"
					className="relative z-10 text-3xl font-bold tracking-tight gradient-text sm:text-4xl md:text-5xl"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, ease: 'easeOut' }}
					viewport={{ once: true }}
				>
					{t('about.cta.title')}
				</motion.h2>

				<motion.p
					className="relative z-10 mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:mt-8 sm:text-lg md:text-xl"
					initial={{ opacity: 0, y: 12 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
					viewport={{ once: true }}
				>
					{t('about.cta.subtitle')}
				</motion.p>

				<motion.div
					className="relative z-10 mt-10 flex justify-center sm:mt-12"
					initial={{ opacity: 0, y: 12 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.45, delay: 0.15 }}
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
