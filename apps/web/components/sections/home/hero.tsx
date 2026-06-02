/** biome-ignore-all lint/a11y/useSemanticElements: any */
'use client'

import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { type ReactNode, useMemo, useState } from 'react'
import { Button } from '~/components/base/button'
import { SectionContainer } from '~/components/shared/section-container'
import { useTypewriter } from '~/hooks/use-typewriter'
import { useI18n } from '~/lib/i18n'
import { cn } from '~/lib/utils'

const WaitlistModal = dynamic(
	() =>
		import('~/components/sections/waitlist/waitlist-modal').then((mod) => ({
			default: mod.WaitlistModal,
		})),
	{
		loading: () => null,
		ssr: false,
	},
)

const fadeUp = (delay = 0) => ({
	initial: { opacity: 0, y: 24 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
})

const BUILT_WITH_PARTNERS = [
	{
		name: 'Trustless Work',
		href: 'https://www.trustlesswork.com/',
		src: '/images/partners/trustless-work.webp',
		width: 120,
		height: 120,
		className: 'h-8 w-8 sm:h-9 sm:w-9',
	},
	{
		name: 'MoneyGram',
		href: 'https://www.moneygram.com/',
		src: '/images/partners/moneygram.png',
		width: 192,
		height: 48,
		className: 'h-6 sm:h-7 w-auto',
	},
] as const

export function Hero() {
	const { t } = useI18n()

	const heroWords = useMemo(
		() => [
			t('home.heroWords.impact'),
			t('home.heroWords.change'),
			t('home.heroWords.hope'),
			t('home.heroWords.results'),
			t('home.heroWords.trust'),
			t('home.heroWords.progress'),
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
			className="relative isolate overflow-hidden bg-[#fafbfc] pt-24 pb-12 sm:pt-28 sm:pb-14 lg:pt-32 lg:pb-16"
			aria-labelledby="hero-title"
			role="banner"
		>
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute inset-0 bg-grid-slate-100/60 [mask-image:radial-gradient(ellipse_at_center,white,transparent_72%)]" />
				<div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl animate-blob" />
				<div className="absolute -right-16 top-32 h-80 w-80 rounded-full bg-indigo-200/35 blur-3xl animate-blob animation-delay-2000" />
				<div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-green-100/50 blur-3xl animate-blob animation-delay-4000" />
			</div>

			<SectionContainer className="relative">
				<div className="mx-auto flex max-w-5xl flex-col items-center text-center">
					<motion.div {...fadeUp(0)} className="mb-5 max-w-xl space-y-3">
						<p className="text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-700/80">
							{t('home.heroEyebrow')}
						</p>
						<p className="text-sm leading-relaxed text-slate-600 sm:text-[15px]">
							{t('home.heroPainStatement')}
						</p>
					</motion.div>

					<motion.h1
						id="hero-title"
						{...fadeUp(0.1)}
						className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
					>
						<span className="block gradient-text">{t('home.heroTitle')}</span>
						<span
							className="mt-2 inline-flex min-h-[1.15em] items-center justify-center text-emerald-700"
							style={{ minWidth: `${longestWordCh}ch` }}
							aria-live="polite"
						>
							{displayText}
							<span
								className="ml-1 inline-block h-[0.95em] w-[3px] rounded-full bg-emerald-600 animate-pulse align-middle"
								aria-hidden
							/>
						</span>
					</motion.h1>

					<motion.div
						{...fadeUp(0.2)}
						className="mt-10 flex w-full flex-col items-center gap-12 sm:mt-12"
					>
						<WaitlistCTA />

						<EcosystemPartners
							supportedByLabel={t('home.supportedBy')}
							builtUsingLabel={t('home.builtUsing')}
						/>
					</motion.div>
				</div>
			</SectionContainer>
		</section>
	)
}

interface EcosystemPartnersProps {
	supportedByLabel: string
	builtUsingLabel: string
}

function EcosystemPartners({ supportedByLabel, builtUsingLabel }: EcosystemPartnersProps) {
	return (
		<motion.div {...fadeUp(0.4)} className="w-full max-w-4xl pt-8">
			<div className="flex flex-col items-center gap-8 sm:gap-6">
				<PartnerRow label={supportedByLabel}>
					<a
						href="https://stellar.org/"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Visit Stellar.org"
						className="group inline-flex items-center opacity-80 transition-opacity hover:opacity-100"
					>
						<Image
							src="/images/SDF.webp"
							alt="Stellar Development Foundation"
							width={420}
							height={110}
							className="h-10 w-auto object-contain sm:h-12"
							priority
						/>
					</a>
				</PartnerRow>

				<PartnerRow label={builtUsingLabel}>
					<div className="flex flex-wrap items-center justify-center gap-3">
						{BUILT_WITH_PARTNERS.map((partner) => (
							<a
								key={partner.name}
								href={partner.href}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={`Visit ${partner.name}`}
								className="group inline-flex items-center justify-center rounded-md px-3 py-2 transition-opacity hover:opacity-100 opacity-85"
							>
								<Image
									src={partner.src}
									alt={partner.name}
									width={partner.width}
									height={partner.height}
									className={cn(partner.className, 'object-contain')}
								/>
							</a>
						))}
					</div>
				</PartnerRow>
			</div>
		</motion.div>
	)
}

function PartnerRow({ label, children }: { label: string; children: ReactNode }) {
	return (
		<div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
			<span className="shrink-0 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
				{label}
			</span>
			{children}
		</div>
	)
}

function WaitlistCTA() {
	const [open, setOpen] = useState(false)
	const { t } = useI18n()

	return (
		<>
			<Button
				size="lg"
				className="gradient-btn h-12 min-w-[220px] rounded-full px-8 text-base font-semibold text-white shadow-lg shadow-emerald-900/10 transition-transform hover:scale-[1.02]"
				onClick={() => setOpen(true)}
			>
				{t('home.waitlistProject')}
			</Button>
			<WaitlistModal open={open} onOpenChange={setOpen} />
		</>
	)
}
