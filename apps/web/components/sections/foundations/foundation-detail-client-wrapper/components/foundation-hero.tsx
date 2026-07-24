'use client'

import { motion, useReducedMotion } from 'framer-motion'
import {
	Building2,
	Calendar,
	CheckCircle2,
	Heart,
	ImageIcon,
	Settings2,
	Share2,
	Users,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { type ReactNode, useState } from 'react'
import { Button } from '~/components/base/button'
import { useI18n } from '~/lib/i18n'
import type { getFoundationBySlug } from '~/lib/queries/foundations/get-foundation-by-slug'
import { cn } from '~/lib/utils'
import { SocialShareButtons } from './social-share-buttons'

type Foundation = NonNullable<Awaited<ReturnType<typeof getFoundationBySlug>>>

interface FoundationHeroProps {
	foundation: Foundation
	slug: string
	yearFounded: number | null
	formattedDonations: string
	shareUrl: string
	isFounder: boolean
}

interface HeroStatProps {
	label: string
	value: ReactNode
	icon: typeof Heart
}

const fadeUp = (delay: number, reduce: boolean | null) =>
	reduce
		? {}
		: {
				initial: { opacity: 0, y: 18 },
				animate: { opacity: 1, y: 0 },
				transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
			}

function HeroStat({ label, value, icon: Icon }: HeroStatProps) {
	return (
		<div className="flex flex-col gap-1.5 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3.5 sm:px-5 sm:py-4">
			<div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
				<Icon className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
				<span className="truncate">{label}</span>
			</div>
			<p className="text-xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-2xl">
				{value}
			</p>
		</div>
	)
}

function CoverOverlays() {
	return (
		<>
			<div
				className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(15,23,42,0.4)_100%)]"
				aria-hidden="true"
			/>
			<div
				className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-black/35 to-transparent"
				aria-hidden="true"
			/>
			<div
				className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-black/55 via-black/20 to-transparent"
				aria-hidden="true"
			/>
			<div
				className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-emerald-300/45 to-transparent"
				aria-hidden="true"
			/>
		</>
	)
}

function CoverPlaceholder({ alt }: { alt: string }) {
	return (
		<div
			className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-emerald-900 via-slate-800 to-slate-900"
			role="img"
			aria-label={alt}
		>
			<div
				className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.14)_1px,transparent_0)] bg-size-[24px_24px] opacity-30"
				aria-hidden="true"
			/>
			<div
				className="absolute -left-16 top-10 h-56 w-56 rounded-full bg-emerald-500/25 blur-3xl"
				aria-hidden="true"
			/>
			<div
				className="absolute -right-12 bottom-6 h-48 w-48 rounded-full bg-teal-400/15 blur-3xl"
				aria-hidden="true"
			/>
			<div className="relative flex flex-col items-center gap-3 text-white/70">
				<div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm">
					<ImageIcon className="h-7 w-7" aria-hidden="true" />
				</div>
				<p className="max-w-xs px-6 text-center text-sm font-medium text-white/80">{alt}</p>
			</div>
		</div>
	)
}

export function FoundationHero({
	foundation,
	slug,
	yearFounded,
	formattedDonations,
	shareUrl,
	isFounder,
}: FoundationHeroProps) {
	const { t } = useI18n()
	const reducedMotion = useReducedMotion()
	const [hasCoverError, setHasCoverError] = useState(false)

	const coverSrc =
		foundation.coverImageUrl?.trim() && !hasCoverError ? foundation.coverImageUrl.trim() : null
	const hasActiveCampaigns = foundation.totalCampaignsOpen > 0

	return (
		<motion.section
			className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
			initial={reducedMotion ? false : { opacity: 0, y: 20 }}
			animate={reducedMotion ? false : { opacity: 1, y: 0 }}
			transition={reducedMotion ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
			aria-labelledby="foundation-hero-title"
		>
			<div className="relative h-72 w-full overflow-hidden bg-slate-900 sm:h-80 md:h-96 lg:h-104">
				{coverSrc ? (
					<>
						<Image
							src={coverSrc}
							alt=""
							aria-hidden="true"
							fill
							className="scale-110 object-cover object-[center_38%] blur-2xl brightness-75 saturate-125"
							sizes="(max-width: 1152px) 100vw, 72rem"
							quality={40}
							priority
							onError={() => setHasCoverError(true)}
						/>
						<motion.div
							className="absolute inset-0"
							initial={reducedMotion ? false : { scale: 1.06, opacity: 0.92 }}
							animate={reducedMotion ? false : { scale: 1, opacity: 1 }}
							transition={
								reducedMotion ? { duration: 0 } : { duration: 0.9, ease: [0.22, 1, 0.36, 1] }
							}
						>
							<Image
								src={coverSrc}
								alt={`${foundation.name} cover`}
								fill
								className="object-cover object-[center_38%]"
								sizes="(max-width: 1152px) 100vw, 72rem"
								quality={90}
								priority
								onError={() => setHasCoverError(true)}
							/>
						</motion.div>
					</>
				) : (
					<CoverPlaceholder alt={`${foundation.name} cover`} />
				)}

				<CoverOverlays />

				<div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-4 md:p-6">
					{hasActiveCampaigns ? (
						<span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-emerald-600/95 px-3 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur-sm">
							<span className="relative flex h-2 w-2">
								<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60 opacity-75" />
								<span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
							</span>
							{t('foundations.active')}
						</span>
					) : (
						<span />
					)}
				</div>
			</div>

			<div className="relative px-5 pb-7 pt-16 sm:px-7 sm:pt-20 md:px-9 md:pb-9 md:pt-24">
				{/* Logo alone overlaps the cover — title stays fully in the white panel */}
				<div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 md:left-9 md:translate-x-0">
					{foundation.logoUrl ? (
						<div className="relative h-28 w-28 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-xl ring-1 ring-slate-200/80 sm:h-32 sm:w-32 md:h-36 md:w-36">
							<Image
								src={foundation.logoUrl}
								alt={`${foundation.name} logo`}
								fill
								className="object-cover p-2.5"
								sizes="(max-width: 640px) 112px, (max-width: 768px) 128px, 144px"
								priority
							/>
						</div>
					) : (
						<div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-linear-to-br from-emerald-600 to-emerald-900 shadow-xl ring-1 ring-slate-200/80 sm:h-32 sm:w-32 md:h-36 md:w-36">
							<Building2 className="h-12 w-12 text-white sm:h-14 sm:w-14" aria-hidden="true" />
						</div>
					)}
				</div>

				<div className="mb-6 space-y-4 text-center md:mb-8 md:pl-44 md:text-left lg:pl-48">
					<motion.p
						{...fadeUp(0.05, reducedMotion)}
						className="text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-700/80"
					>
						{t('foundations.detailEyebrow')}
					</motion.p>
					<motion.h1
						id="foundation-hero-title"
						{...fadeUp(0.1, reducedMotion)}
						className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.1]"
					>
						<span className="gradient-text">{foundation.name}</span>
					</motion.h1>
				</div>

				{foundation.description ? (
					<motion.p
						{...fadeUp(0.15, reducedMotion)}
						className="mb-7 w-full text-pretty text-base leading-relaxed text-slate-600 sm:text-lg md:text-xl md:leading-relaxed"
					>
						{foundation.description}
					</motion.p>
				) : null}

				<motion.div
					{...fadeUp(0.2, reducedMotion)}
					className="mb-8 flex w-full flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
				>
					{isFounder ? (
						<Button asChild className="gradient-btn w-full rounded-full text-white sm:w-auto">
							<Link href={`/foundations/${slug}/manage`}>
								<Settings2 className="mr-2 h-4 w-4" aria-hidden="true" />
								{t('foundations.manageFoundation')}
							</Link>
						</Button>
					) : null}

					<div className="flex w-full flex-col gap-2.5 sm:ml-auto sm:w-auto sm:items-end">
						<div className="flex items-center gap-2">
							<Share2 className="h-4 w-4 text-emerald-700" aria-hidden="true" />
							<span className="text-sm font-medium text-slate-700">{t('foundations.share')}</span>
						</div>
						<SocialShareButtons
							url={shareUrl}
							title={foundation.name}
							description={foundation.description}
						/>
					</div>
				</motion.div>

				<motion.div
					{...fadeUp(0.28, reducedMotion)}
					className={cn(
						'grid gap-3',
						yearFounded != null ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3',
					)}
					aria-label={t('foundations.detailStatsAria')}
				>
					{yearFounded != null ? (
						<HeroStat label={t('foundations.founded')} value={yearFounded} icon={Calendar} />
					) : null}
					<HeroStat
						label={t('foundations.completed')}
						value={foundation.totalCampaignsCompleted}
						icon={CheckCircle2}
					/>
					<HeroStat
						label={t('foundations.active')}
						value={foundation.totalCampaignsOpen}
						icon={Users}
					/>
					<HeroStat label={t('foundations.raised')} value={formattedDonations} icon={Heart} />
				</motion.div>
			</div>
		</motion.section>
	)
}
