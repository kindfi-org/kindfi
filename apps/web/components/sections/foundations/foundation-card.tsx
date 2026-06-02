'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Building2, Calendar, Globe, Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { memo } from 'react'
import { cardHover } from '~/lib/constants/animations'
import { useI18n } from '~/lib/i18n'
import { getSocialIcon } from '~/lib/icons/social-icons'
import { cn } from '~/lib/utils'

interface FoundationCardProps {
	foundation: {
		id: string
		name: string
		slug: string
		description: string
		logoUrl: string | null
		coverImageUrl: string | null
		foundedYear: number
		websiteUrl: string | null
		socialLinks: Record<string, string>
		totalDonationsReceived: number
		totalCampaignsCompleted: number
		totalCampaignsOpen: number
		founder: {
			id: string
			displayName: string | null
			imageUrl: string | null
			slug: string | null
		} | null
	}
}

const FoundationCardComponent = ({ foundation }: FoundationCardProps) => {
	const { t } = useI18n()
	const yearFounded = foundation.foundedYear > 0 ? foundation.foundedYear : null
	const hasActiveCampaigns = foundation.totalCampaignsOpen > 0
	const hasSocialLinks =
		foundation.websiteUrl != null ||
		(foundation.socialLinks != null && Object.keys(foundation.socialLinks).length > 0)
	const shouldReduceMotion = useReducedMotion()

	return (
		<motion.article
			className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200/80 hover:shadow-lg"
			whileHover={shouldReduceMotion ? {} : cardHover}
		>
			<Link
				href={`/foundations/${foundation.slug}`}
				className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				aria-label={`${t('foundations.exploreFoundation')}: ${foundation.name}`}
			/>
			<div className="relative h-40 overflow-hidden bg-gradient-to-br from-emerald-50 via-slate-50 to-indigo-50">
				{foundation.coverImageUrl ? (
					<>
						<Image
							src={foundation.coverImageUrl}
							alt=""
							fill
							className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
							loading="lazy"
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />
					</>
				) : (
					<div className="absolute inset-0 bg-gradient-to-br from-emerald-100/80 via-slate-50 to-indigo-50" />
				)}

				{hasActiveCampaigns ? (
					<div className="absolute right-4 top-4">
						<span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
							<span className="relative flex h-2 w-2">
								<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60 opacity-75" />
								<span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
							</span>
							{t('foundations.active')}
						</span>
					</div>
				) : null}

				<div className="absolute inset-0 flex items-end justify-end p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
					<span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/95 px-4 py-2 text-sm font-medium text-slate-900 shadow-sm backdrop-blur-sm">
						{t('foundations.exploreFoundation')}
						<ArrowRight
							className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
							aria-hidden="true"
						/>
					</span>
				</div>
			</div>

			<div className="relative z-10 flex flex-grow flex-col p-6">
				{foundation.logoUrl ? (
					<div className="relative z-10 -mt-12 mb-4 flex justify-center">
						<div className="relative h-28 w-28 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg ring-2 ring-slate-200/80 transition-all duration-300 group-hover:ring-emerald-200/80">
							<Image
								src={foundation.logoUrl}
								alt={`${foundation.name} logo`}
								fill
								className="object-cover p-2"
								sizes="112px"
							/>
						</div>
					</div>
				) : (
					<div className="relative z-10 -mt-12 mb-4 flex justify-center">
						<div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-lg ring-2 ring-slate-200/80">
							<Building2 className="h-12 w-12 text-white" aria-hidden="true" />
						</div>
					</div>
				)}

				<h3 className="mb-2 line-clamp-1 text-center text-xl font-bold text-balance text-slate-900 transition-colors group-hover:text-emerald-800">
					{foundation.name}
				</h3>

				<p className="mb-6 line-clamp-2 min-w-0 text-center text-sm text-muted-foreground">
					{foundation.description}
				</p>

				<div
					className={cn(
						'mb-6 grid gap-4 border-b border-slate-100 pb-6',
						yearFounded != null ? 'grid-cols-3' : 'grid-cols-2',
					)}
				>
					{yearFounded != null ? (
						<div className="text-center">
							<div className="mb-1 flex items-center justify-center gap-1 text-emerald-700">
								<Calendar className="h-4 w-4" aria-hidden="true" />
							</div>
							<p className="text-lg font-bold tabular-nums text-slate-900">{yearFounded}</p>
							<p className="text-xs text-muted-foreground">{t('foundations.founded')}</p>
						</div>
					) : null}
					<div className="text-center">
						<div className="mb-1 flex items-center justify-center gap-1 text-emerald-600">
							<Building2 className="h-4 w-4" aria-hidden="true" />
						</div>
						<p className="text-lg font-bold tabular-nums text-slate-900">
							{foundation.totalCampaignsCompleted}
						</p>
						<p className="text-xs text-muted-foreground">{t('foundations.completed')}</p>
					</div>
					<div className="text-center">
						<div className="mb-1 flex items-center justify-center gap-1 text-emerald-600">
							<Heart className="h-4 w-4" aria-hidden="true" />
						</div>
						<p className="text-lg font-bold tabular-nums text-slate-900">
							{new Intl.NumberFormat('en-US', {
								style: 'currency',
								currency: 'USD',
								minimumFractionDigits: 0,
								maximumFractionDigits: 0,
							}).format(foundation.totalDonationsReceived)}
						</p>
						<p className="text-xs text-muted-foreground">{t('foundations.raised')}</p>
					</div>
				</div>

				{hasSocialLinks ? (
					<div className="relative z-10 mb-4 flex flex-wrap items-center gap-2">
						{foundation.websiteUrl ? (
							<a
								href={foundation.websiteUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="relative z-10 rounded-lg border border-slate-200 bg-white p-2 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
								aria-label={t('foundations.visitWebsite')}
							>
								<Globe className="h-4 w-4 text-emerald-700" aria-hidden="true" />
							</a>
						) : null}
						{foundation.socialLinks != null
							? Object.entries(foundation.socialLinks).map(([platform, url]) => {
									const Icon = getSocialIcon(platform)
									return (
										<a
											key={platform}
											href={url}
											target="_blank"
											rel="noopener noreferrer"
											className="relative z-10 rounded-lg border border-slate-200 bg-white p-2 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
											aria-label={t('foundations.visitPlatform').replace('{platform}', platform)}
										>
											<Icon className="h-4 w-4 text-emerald-700" aria-hidden="true" />
										</a>
									)
								})
							: null}
					</div>
				) : null}

				{foundation.founder ? (
					<div className="mt-auto flex items-center gap-3">
						{foundation.founder.imageUrl ? (
							<div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-slate-200">
								<Image
									src={foundation.founder.imageUrl}
									alt=""
									fill
									className="object-cover"
									sizes="32px"
								/>
							</div>
						) : (
							<div className="h-8 w-8 flex-shrink-0 rounded-full bg-slate-100" />
						)}
						<div className="min-w-0 flex-1">
							<p className="text-xs text-muted-foreground">{t('foundations.foundedBy')}</p>
							{foundation.founder.slug ? (
								<Link
									href={`/u/${foundation.founder.slug}`}
									className="relative z-10 line-clamp-1 rounded text-sm font-semibold text-slate-900 transition-colors hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
								>
									{foundation.founder.displayName ?? 'Anonymous'}
								</Link>
							) : (
								<p className="line-clamp-1 text-sm font-semibold text-slate-900">
									{foundation.founder.displayName ?? 'Anonymous'}
								</p>
							)}
						</div>
					</div>
				) : null}
			</div>
		</motion.article>
	)
}

export const FoundationCard = memo(FoundationCardComponent)
