/** biome-ignore-all lint/a11y/useSemanticElements: any */
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import { Button } from '~/components/base/button'
import { WaitlistModal } from '~/components/sections/waitlist/waitlist-modal'
import { SectionContainer } from '~/components/shared/section-container'
import { useTypewriter } from '~/hooks/use-typewriter'
import { useI18n } from '~/lib/i18n'

export function Hero() {
	const { t } = useI18n()

	const heroWords = useMemo(
		() => [
			t('home.heroWords.impact'),
			t('home.heroWords.causes'),
			t('home.heroWords.world'),
			t('home.heroWords.support'),
			t('home.heroWords.trust'),
			t('home.heroWords.adoption'),
			t('home.heroWords.needs'),
		],
		[t],
	)

	const { displayText, longestWordCh } = useTypewriter(heroWords, {
		typingSpeedMs: 120,
		deletingSpeedMs: 70,
		fullWordPauseMs: 1200,
		emptyPauseMs: 400,
		order: 'sequential',
		loop: true,
	})

		return (
		<section
			className="relative z-0 min-h-[85vh] bg-gradient-to-b from-violet-50 via-white/80 to-white pt-24 pb-16 sm:pt-28 sm:pb-20"
			aria-labelledby="hero-title"
			role="banner"
		>
			<SectionContainer>
				<div className="text-center">
					<motion.h2
						className="text-base sm:text-lg font-semibold text-gray-600 mb-3 tracking-wide uppercase"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						{t('home.heroSubtitle')}
					</motion.h2>

					<motion.h1
						id="hero-title"
						className="text-4xl font-bold tracking-tight gradient-text mb-6 py-2 text-center sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl sm:mb-8 sm:py-4"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
					>
						{t('home.heroTitle')}
						<span
							className="inline-flex items-center"
							style={{ minWidth: `${longestWordCh}ch` }}
							aria-live="polite"
						>
							{displayText}
							<span
								className="ml-1 inline-block h-[1em] w-[2px] bg-current animate-pulse align-middle"
								aria-hidden
							/>
						</span>
					</motion.h1>

					<motion.p
						className="text-base text-gray-600 max-w-2xl mx-auto px-4 mt-8 mb-10 leading-relaxed sm:text-lg sm:mt-10 sm:mb-12"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.4 }}
					>
						{t('home.heroDescription')}
					</motion.p>

					<motion.div
						className="flex flex-col items-center gap-10 sm:gap-12"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.6 }}
					>
						<div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
							<WaitlistCTA />
						</div>
						<div className="flex flex-col items-center gap-4 pt-4 border-t border-gray-200/80">
							<span className="text-sm font-medium text-muted-foreground">
								{t('home.supportedBy')}
							</span>
							<a
								href="https://stellar.org/"
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Visit Stellar.org"
								className="opacity-90 hover:opacity-100 transition-opacity"
							>
								<Image
									src="/images/SDF.webp"
									alt="Stellar Development Foundation"
									width={420}
									height={110}
									className="h-14 sm:h-[72px] w-auto"
									priority
								/>
							</a>
						</div>
					</motion.div>
				</div>
			</SectionContainer>
		</section>
	)
}

function WaitlistCTA() {
	const [open, setOpen] = useState(false)
	const { t } = useI18n()
	return (
		<>
			<Button
				size="lg"
				variant="outline"
				className="gradient-border-btn"
				onClick={() => setOpen(true)}
			>
				{t('home.waitlistProject')}
			</Button>
			<WaitlistModal open={open} onOpenChange={setOpen} />
		</>
	)
}
