'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '~/components/base/button'
import { SectionContainer } from '~/components/shared/section-container'
import { useI18n } from '~/lib/i18n'

export function TutorialsCta() {
	const { t } = useI18n()
	const reducedMotion = useReducedMotion()

	return (
		<section
			className="relative overflow-hidden border-t border-slate-200/60 bg-white py-16 sm:py-20"
			aria-labelledby="tutorials-cta-heading"
		>
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute -right-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-emerald-100/40 blur-3xl" />
				<div className="absolute -left-24 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-indigo-100/30 blur-3xl" />
			</div>

			<SectionContainer maxWidth="4xl" className="relative text-center">
				<motion.h2
					id="tutorials-cta-heading"
					className="text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
					initial={reducedMotion ? false : { opacity: 0, y: 20 }}
					whileInView={reducedMotion ? false : { opacity: 1, y: 0 }}
					transition={reducedMotion ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
					viewport={{ once: true }}
				>
					<span className="gradient-text">{t('tutorials.cta.title')}</span>
				</motion.h2>

				<motion.p
					className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg"
					initial={reducedMotion ? false : { opacity: 0, y: 12 }}
					whileInView={reducedMotion ? false : { opacity: 1, y: 0 }}
					transition={
						reducedMotion
							? { duration: 0 }
							: { duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }
					}
					viewport={{ once: true }}
				>
					{t('tutorials.cta.subtitle')}
				</motion.p>

				<motion.div
					className="mt-8 flex flex-col justify-center gap-4 sm:flex-row"
					initial={reducedMotion ? false : { opacity: 0, y: 12 }}
					whileInView={reducedMotion ? false : { opacity: 1, y: 0 }}
					transition={
						reducedMotion
							? { duration: 0 }
							: { duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }
					}
					viewport={{ once: true }}
				>
					<Link href="/faqs">
						<Button size="lg" className="gradient-btn text-white shadow-sm hover:shadow-md">
							{t('tutorials.cta.faqs')}
						</Button>
					</Link>
					<Link href="/governance">
						<Button
							size="lg"
							variant="outline"
							className="gradient-border-btn bg-white transition-all duration-300"
						>
							{t('tutorials.cta.community')}
						</Button>
					</Link>
				</motion.div>
			</SectionContainer>
		</section>
	)
}
