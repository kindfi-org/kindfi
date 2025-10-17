/** biome-ignore-all lint/a11y/useSemanticElements: any */
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'
import { Button } from '~/components/base/button'
import { WaitlistModal } from '~/components/sections/waitlist/waitlist-modal'
import { SectionContainer } from '~/components/shared/section-container'
import { useTypewriter } from '~/hooks/use-typewriter'
import { useI18n } from '~/lib/i18n'

export function Hero() {
	const { t } = useI18n()

	const HERO_WORDS = [
		t('home.heroWords.impact'),
		t('home.heroWords.causes'),
		t('home.heroWords.world'),
		t('home.heroWords.support'),
		t('home.heroWords.trust'),
		t('home.heroWords.adoption'),
		t('home.heroWords.needs'),
	]

	const { displayText, longestWordCh } = useTypewriter(HERO_WORDS, {
		typingSpeedMs: 120,
		deletingSpeedMs: 70,
		fullWordPauseMs: 1200,
		emptyPauseMs: 400,
		order: 'sequential',
		loop: true,
	})

	return (
		<section
			className="relative z-0 min-h-[80vh] bg-gradient-to-b from-purple to-white pt-20 pb-8"
			aria-labelledby="hero-title"
			role="banner"
		>
			<SectionContainer>
				<div className="text-center">
					<motion.h2
						className="text-xl font-semibold text-gray-800 mb-2"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						{t('home.heroSubtitle')}
					</motion.h2>

					<motion.h1
						className="text-8xl font-bold gradient-text mb-4 py-4 text-center"
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
						className="text-lg text-gray-700 m-12"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.4 }}
					>
						{t('home.heroDescription')}
					</motion.p>

					<motion.div
						className="flex flex-col sm:flex-row gap-4 justify-center"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.6 }}
					>
						<WaitlistCTA />
					</motion.div>
					<motion.div
						className="flex flex-col sm:flex-row gap-4 justify-center"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.6 }}
					>
						<div className="mt-8 flex flex-col items-center gap-3">
							<span className="text-lg text-muted-foreground">
								{t('home.supportedBy')}
							</span>
							<a
								href="https://stellar.org/"
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Visit Stellar.org"
							>
								<Image
									src="/images/SDF.webp"
									alt="Stellar Development Foundation"
									width={420}
									height={110}
									className="h-[72px] w-auto"
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
