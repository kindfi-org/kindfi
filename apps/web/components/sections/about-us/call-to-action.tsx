'use client'

import { motion } from 'framer-motion'
import { CTAButtons } from '~/components/shared/cta-buttons'
import { useTranslation } from '~/hooks/use-translation'

const CallToAction = () => {
	const { t } = useTranslation()
	return (
		<section
			className="relative flex flex-col items-center text-center py-16 sm:py-20 lg:py-24 px-4 sm:px-8 overflow-hidden bg-gradient-to-b from-violet-50/80 via-white to-white"
			aria-labelledby="about-cta-heading"
		>
			<motion.h2
				id="about-cta-heading"
				className="text-3xl font-bold gradient-text relative z-10 tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
				initial={{ opacity: 0, y: 24 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, ease: 'easeOut' }}
				viewport={{ once: true }}
			>
				{t('about.cta.title')}
			</motion.h2>

			<motion.p
				className="text-base text-muted-foreground mt-6 mb-10 max-w-2xl mx-auto relative z-10 leading-relaxed sm:text-lg md:text-xl sm:mt-8 sm:mb-12"
				initial={{ opacity: 0, y: 16 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
				viewport={{ once: true }}
			>
				{t('about.cta.subtitle')}
			</motion.p>
			<CTAButtons
				primaryText={t('about.cta.primary')}
				secondaryText={t('about.cta.secondary')}
				primaryHref="/projects"
				secondaryHref="/sign-up"
			/>
		</section>
	)
}

export { CallToAction }
