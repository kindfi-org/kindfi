'use client'

import { motion } from 'framer-motion'
import { CTAButtons } from '~/components/shared/cta-buttons'
import { useTranslation } from '~/hooks/use-translation'

const CallToAction = () => {
	const { t } = useTranslation()
	return (
		<section className="flex flex-col items-center text-center py-24 px-8 relative overflow-hidden font-custom">
			<motion.h2
				className="text-6xl font-bold gradient-text relative z-10 tracking-tight"
				initial={{ opacity: 0, y: 30 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, ease: 'easeOut' }}
				viewport={{ once: true }}
			>
				{t('about.cta.title')}
			</motion.h2>

			<motion.p
				className="text-2xl text-gray-700 my-8 max-w-3xl relative z-10 leading-relaxed"
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
				viewport={{ once: true }}
			>
				{t('about.cta.subtitle')}
			</motion.p>
			<CTAButtons
				primaryText={t('about.cta.primary')}
				secondaryText={t('about.cta.secondary')}
				primaryHref={'/projects'}
				secondaryHref={'/sign-up'}
			/>
		</section>
	)
}

export { CallToAction }
