'use client'

import { motion, useReducedMotion } from 'framer-motion'
import {
	ArrowRight,
	Building2,
	Calendar,
	Facebook,
	Globe,
	Heart,
	Instagram,
	LinkedinIcon,
	Twitter,
	Youtube,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { memo } from 'react'
import { cardHover } from '~/lib/constants/animations'
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

function getSocialIcon(platform: string) {
	const normalized = platform.toLowerCase()
	if (normalized.includes('twitter') || normalized.includes('x.com')) {
		return Twitter
	}
	if (normalized.includes('linkedin')) {
		return LinkedinIcon
	}
	if (normalized.includes('facebook')) {
		return Facebook
	}
	if (normalized.includes('instagram')) {
		return Instagram
	}
	if (normalized.includes('youtube')) {
		return Youtube
	}
	return Globe
}

const FoundationCardComponent = ({ foundation }: FoundationCardProps) => {
	const yearFounded = foundation.foundedYear > 0 ? foundation.foundedYear : null
	const hasActiveCampaigns = foundation.totalCampaignsOpen > 0
	const hasSocialLinks =
		foundation.websiteUrl != null ||
		(foundation.socialLinks != null &&
			Object.keys(foundation.socialLinks).length > 0)
	const shouldReduceMotion = useReducedMotion()

	return (
		<Link
			href={`/foundations/${foundation.slug}`}
			className="h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
		>
			<motion.article
				className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:border-primary/25 hover:shadow-md"
				whileHover={shouldReduceMotion ? {} : cardHover}
				initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
			>
				<div className="relative h-40 overflow-hidden bg-gradient-to-br from-primary/15 via-muted to-primary/5">
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
							<div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
						</>
					) : (
						<div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-muted to-primary/10" />
					)}

					{hasActiveCampaigns ? (
						<div className="absolute right-4 top-4">
							<span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm">
								<span className="relative flex h-2 w-2">
									<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-foreground/60 opacity-75" />
									<span className="relative inline-flex h-2 w-2 rounded-full bg-primary-foreground" />
								</span>
								Active
							</span>
						</div>
					) : null}

					<div className="absolute inset-0 flex items-end justify-end p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
						<span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/95 px-4 py-2 text-sm font-medium text-foreground shadow-sm backdrop-blur-sm">
							Explore foundation
							<ArrowRight
								className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
								aria-hidden="true"
							/>
						</span>
					</div>
				</div>

				<div className="flex flex-grow flex-col p-6">
					{foundation.logoUrl ? (
						<div className="relative z-10 -mt-12 mb-4 flex justify-center">
							<div className="relative h-28 w-28 overflow-hidden rounded-2xl border-4 border-card bg-card shadow-lg ring-2 ring-border transition-all duration-300 group-hover:scale-[1.02] group-hover:ring-primary/25">
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
							<div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border-4 border-card bg-gradient-to-br from-primary to-primary/70 shadow-lg ring-2 ring-border">
								<Building2
									className="h-12 w-12 text-primary-foreground"
									aria-hidden="true"
								/>
							</div>
						</div>
					)}

					<h3 className="mb-2 line-clamp-1 text-center text-xl font-bold text-balance transition-colors group-hover:text-primary">
						{foundation.name}
					</h3>

					<p className="mb-6 line-clamp-2 min-w-0 text-center text-sm text-muted-foreground">
						{foundation.description}
					</p>

					<div
						className={cn(
							'mb-6 grid gap-4 border-b border-border pb-6',
							yearFounded != null ? 'grid-cols-3' : 'grid-cols-2',
						)}
					>
						{yearFounded != null ? (
							<div className="text-center">
								<div className="mb-1 flex items-center justify-center gap-1 text-primary">
									<Calendar className="h-4 w-4" aria-hidden="true" />
								</div>
								<p className="text-lg font-bold tabular-nums">{yearFounded}</p>
								<p className="text-xs text-muted-foreground">Founded</p>
							</div>
						) : null}
						<div className="text-center">
							<div className="mb-1 flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400">
								<Building2 className="h-4 w-4" aria-hidden="true" />
							</div>
							<p className="text-lg font-bold tabular-nums">
								{foundation.totalCampaignsCompleted}
							</p>
							<p className="text-xs text-muted-foreground">Completed</p>
						</div>
						<div className="text-center">
							<div className="mb-1 flex items-center justify-center gap-1 text-primary">
								<Heart className="h-4 w-4" aria-hidden="true" />
							</div>
							<p className="text-lg font-bold tabular-nums">
								{new Intl.NumberFormat('en-US', {
									style: 'currency',
									currency: 'USD',
									minimumFractionDigits: 0,
									maximumFractionDigits: 0,
								}).format(foundation.totalDonationsReceived)}
							</p>
							<p className="text-xs text-muted-foreground">Raised</p>
						</div>
					</div>

					{hasSocialLinks ? (
						<div className="mb-4 flex flex-wrap items-center gap-2">
							{foundation.websiteUrl ? (
								<a
									href={foundation.websiteUrl}
									target="_blank"
									rel="noopener noreferrer"
									onClick={(e) => e.stopPropagation()}
									className="rounded-lg border border-border p-2 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
									aria-label="Visit website"
								>
									<Globe className="h-4 w-4 text-primary" aria-hidden="true" />
								</a>
							) : null}
							{foundation.socialLinks != null
								? Object.entries(foundation.socialLinks).map(
										([platform, url]) => {
											const Icon = getSocialIcon(platform)
											return (
												<a
													key={platform}
													href={url}
													target="_blank"
													rel="noopener noreferrer"
													onClick={(e) => e.stopPropagation()}
													className="rounded-lg border border-border p-2 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
													aria-label={`Visit ${platform}`}
												>
													<Icon
														className="h-4 w-4 text-primary"
														aria-hidden="true"
													/>
												</a>
											)
										},
									)
								: null}
						</div>
					) : null}

					{foundation.founder ? (
						<div className="mt-auto flex items-center gap-3">
							{foundation.founder.imageUrl ? (
								<div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-border">
									<Image
										src={foundation.founder.imageUrl}
										alt=""
										fill
										className="object-cover"
										sizes="32px"
									/>
								</div>
							) : (
								<div className="h-8 w-8 flex-shrink-0 rounded-full bg-muted" />
							)}
							<div className="min-w-0 flex-1">
								<p className="text-xs text-muted-foreground">Founded by</p>
								{foundation.founder.slug ? (
									<Link
										href={`/u/${foundation.founder.slug}`}
										onClick={(e) => e.stopPropagation()}
										className="line-clamp-1 rounded text-sm font-semibold transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
									>
										{foundation.founder.displayName ?? 'Anonymous'}
									</Link>
								) : (
									<p className="line-clamp-1 text-sm font-semibold">
										{foundation.founder.displayName ?? 'Anonymous'}
									</p>
								)}
							</div>
						</div>
					) : null}
				</div>
			</motion.article>
		</Link>
	)
}

export const FoundationCard = memo(FoundationCardComponent)
