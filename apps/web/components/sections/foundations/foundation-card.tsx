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
			className="h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 rounded-xl"
		>
			<motion.article
				className="group relative bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:border-purple-200"
				whileHover={shouldReduceMotion ? {} : cardHover}
				initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
			>
				{/* Cover Image */}
				<div className="relative h-40 overflow-hidden bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-pink-500/20">
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
							<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
						</>
					) : (
						<div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-blue-500/30 to-pink-500/30" />
					)}

					{/* Active Badge */}
					{hasActiveCampaigns && (
						<div className="absolute top-4 right-4">
							<span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/90 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
								<span className="relative flex h-2 w-2">
									<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
									<span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
								</span>
								Active
							</span>
						</div>
					)}

					{/* Explore CTA on Hover */}
					<div className="absolute inset-0 flex items-end justify-end p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
						<span className="inline-flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-sm px-4 py-2 text-sm font-medium text-gray-900 shadow-lg">
							Explore Foundation
							<ArrowRight
								className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
								aria-hidden="true"
							/>
						</span>
					</div>
				</div>

				{/* Content */}
				<div className="flex flex-col flex-grow p-6">
					{/* Logo Section - Prominent Display */}
					{foundation.logoUrl ? (
						<div className="flex justify-center mb-4 -mt-12 relative z-10">
							<div className="relative h-28 w-28 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-xl ring-4 ring-purple-50 transition-all duration-300 group-hover:scale-105 group-hover:ring-purple-100 group-hover:shadow-2xl">
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
						<div className="flex justify-center mb-4 -mt-12 relative z-10">
							<div className="relative h-28 w-28 overflow-hidden rounded-2xl border-4 border-white bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 shadow-xl ring-4 ring-purple-50 flex items-center justify-center">
								<Building2
									className="h-12 w-12 text-white"
									aria-hidden="true"
								/>
							</div>
						</div>
					)}

					{/* Foundation Name */}
					<h3 className="text-xl font-bold mb-2 text-center line-clamp-1 text-wrap-balance group-hover:text-purple-600 transition-colors">
						{foundation.name}
					</h3>

					{/* Description */}
					<p className="text-muted-foreground mb-6 text-sm text-center line-clamp-2 min-w-0">
						{foundation.description}
					</p>

					{/* Stats Grid */}
					<div
						className={cn(
							'grid gap-4 mb-6 pb-6 border-b border-gray-100',
							yearFounded != null ? 'grid-cols-3' : 'grid-cols-2',
						)}
					>
						{yearFounded != null ? (
							<div className="text-center">
								<div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
									<Calendar className="h-4 w-4" aria-hidden="true" />
								</div>
								<p className="text-lg font-bold tabular-nums">{yearFounded}</p>
								<p className="text-xs text-muted-foreground">Year Founded</p>
							</div>
						) : null}
						<div className="text-center">
							<div className="flex items-center justify-center gap-1 text-green-600 mb-1">
								<Building2 className="h-4 w-4" aria-hidden="true" />
							</div>
							<p className="text-lg font-bold tabular-nums">
								{foundation.totalCampaignsCompleted}
							</p>
							<p className="text-xs text-muted-foreground">Completed</p>
						</div>
						<div className="text-center">
							<div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
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

					{/* Social Links */}
					{hasSocialLinks ? (
						<div className="flex flex-wrap items-center gap-2 mb-4">
							{foundation.websiteUrl ? (
								<a
									href={foundation.websiteUrl}
									target="_blank"
									rel="noopener noreferrer"
									onClick={(e) => e.stopPropagation()}
									className="p-2 rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1"
									aria-label="Visit website"
								>
									<Globe
										className="h-4 w-4 text-purple-600"
										aria-hidden="true"
									/>
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
													className="p-2 rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1"
													aria-label={`Visit ${platform}`}
												>
													<Icon
														className="h-4 w-4 text-purple-600"
														aria-hidden="true"
													/>
												</a>
											)
										},
									)
								: null}
						</div>
					) : null}

					{/* Founder */}
					{foundation.founder ? (
						<div className="flex items-center gap-3 mt-auto">
							{foundation.founder.imageUrl ? (
								<div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-gray-100">
									<Image
										src={foundation.founder.imageUrl}
										alt=""
										fill
										className="object-cover"
										sizes="32px"
									/>
								</div>
							) : (
								<div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex-shrink-0" />
							)}
							<div className="min-w-0 flex-1">
								<p className="text-xs text-muted-foreground">Founded by</p>
								{foundation.founder.slug ? (
									<Link
										href={`/u/${foundation.founder.slug}`}
										onClick={(e) => e.stopPropagation()}
										className="text-sm font-semibold hover:text-purple-600 transition-colors line-clamp-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1 rounded"
									>
										{foundation.founder.displayName ?? 'Anonymous'}
									</Link>
								) : (
									<p className="text-sm font-semibold line-clamp-1">
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
