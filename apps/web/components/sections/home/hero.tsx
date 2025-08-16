/** biome-ignore-all lint/a11y/useSemanticElements: any */
'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Image from 'next/image'
import { Button } from '~/components/base/button'
import { useTypewriter } from '~/hooks/use-typewriter'
import { WaitlistModal } from '~/components/sections/waitlist/waitlist-modal'

const HERO_WORDS = ['Impact', 'Causes', 'World', 'Support', 'Trust', 'Adoption', 'Needs']

export function Hero() {
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
			className="relative z-0 min-h-[80vh] bg-gradient-to-b from-purple-50/50 to-white px-4 pt-20 pb-8"
			aria-labelledby="hero-title"
			role="banner"
		>
			<div className="container mx-auto max-w-6xl">
				<div className="text-center">
					<motion.h2
						className="text-xl font-semibold text-gray-800 mb-2"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						Connect. Support. See the Change.
					</motion.h2>

					<motion.h1
						className="text-8xl font-bold gradient-text mb-2 py-4"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
					>
						Where Blockchain Meets{" "}
						<span
							className="inline-flex items-center"
							style={{ minWidth: `${longestWordCh}ch` }}
							aria-live="polite"
						>
							Real-{displayText}
							<span
								className="ml-1 inline-block h-[1em] w-[2px] bg-current animate-pulse align-middle"
								aria-hidden
							/>
						</span>
					</motion.h1>

					<motion.p
						className="text-lg text-gray-700 my-4"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.4 }}
					>
						KindFi is a Latin American platform that connects donors and social projects for real change. Built on secure blockchain technology,
						we make giving transparent, safe, and easy. With live progress updates so you know your support is making a difference.
						Start your campaign or find a cause to support today.
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
							<span className="text-xl text-muted-foreground">Supported by</span>
							<a href="https://stellar.org/" target="_blank" rel="noopener noreferrer" aria-label="Visit Stellar.org">
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
			</div>
		</section>
	)
}

function WaitlistCTA() {
	const [open, setOpen] = useState(false)
	return (
		<>
			<Button size="lg" variant="outline" className="gradient-border-btn" onClick={() => setOpen(true)}>
				Waitlist your project
			</Button>
			<WaitlistModal open={open} onOpenChange={setOpen} />
		</>
	)
}
