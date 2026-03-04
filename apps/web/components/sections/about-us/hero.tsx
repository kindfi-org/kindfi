'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '~/components/base/button'
import { SectionContainer } from '~/components/shared/section-container'
import { useI18n } from '~/lib/i18n'

export function Hero() {
	const { t } = useI18n()
	return (
		// biome-ignore lint/a11y/useSemanticElements: can't use role with section
		<section
			className="relative z-0 min-h-[70vh] bg-gradient-to-b from-violet-50/80 via-white to-white pt-24 pb-16 sm:pt-28 sm:pb-20"
			aria-labelledby="hero-title"
			role="banner"
		>
			<SectionContainer maxWidth="6xl">
				<div className="text-center">
					<motion.p
						className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						{t('about.heroSubtitle')}
					</motion.p>

					<motion.h1
						id="hero-title"
						className="text-3xl font-bold tracking-tight gradient-text mb-6 sm:text-4xl md:text-5xl lg:text-6xl sm:mb-8"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
					>
						{t('about.heroTitle')}
					</motion.h1>

					<motion.p
						className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed sm:text-lg mt-6 mb-10"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.4 }}
					>
						{t('about.heroDescription')}
					</motion.p>

					<motion.div
						className="flex flex-col sm:flex-row gap-4 justify-center"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.6 }}
					>
						<a
							href="https://www.youtube.com/watch?v=Hlh4R8u-lWU"
							target="_blank"
							rel="noopener noreferrer"
							aria-label={t('about.seeHowItWorks')}
						>
							<Button size="lg" className="gradient-btn text-white">
								{t('about.seeHowItWorks')}
							</Button>
						</a>
						<Link href="/projects">
							<Button
								size="lg"
								variant="outline"
								className="gradient-border-btn"
							>
								{t('about.discoverCauses')}
							</Button>
						</Link>
					</motion.div>
				</div>
			</SectionContainer>
		</section>
	)
}
