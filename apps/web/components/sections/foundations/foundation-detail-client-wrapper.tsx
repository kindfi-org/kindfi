'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { motion, useReducedMotion } from 'framer-motion'
import {
	ArrowRight,
	Building2,
	Calendar,
	CheckCircle2,
	ChevronLeft,
	Eye,
	Facebook,
	Globe,
	Heart,
	Instagram,
	LinkedinIcon,
	Link as LinkIcon,
	Megaphone,
	Settings2,
	Share2,
	Target,
	TrendingUp,
	Twitter,
	Users,
	Youtube,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { Card, CardContent } from '~/components/base/card'
import { getFoundationBySlug } from '~/lib/queries/foundations/get-foundation-by-slug'

interface FoundationDetailClientWrapperProps {
	slug: string
}

const shareActionClass =
	'inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

/**
 * Social sharing buttons component
 * Optimized for performance with memoized URL encoding
 */
const SocialShareButtons = ({
	url,
	title,
	description,
}: {
	url: string
	title: string
	description?: string
}) => {
	const shareData = useMemo(() => {
		const encodedUrl = encodeURIComponent(url)
		const encodedTitle = encodeURIComponent(title)
		const encodedDesc = encodeURIComponent(description || '')

		return {
			twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}${encodedDesc ? `&description=${encodedDesc}` : ''}`,
			facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
			linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDesc}`,
		}
	}, [url, title, description])

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(url)
			toast.success('Link copied to clipboard!')
		} catch {
			toast.error('Failed to copy link')
		}
	}

	return (
		<div className="flex flex-wrap items-center gap-2">
			<a
				href={shareData.twitter}
				target="_blank"
				rel="noopener noreferrer"
				className={shareActionClass}
				aria-label="Share on X (Twitter)"
			>
				<svg
					role="img"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					className="h-4 w-4"
					aria-hidden="true"
				>
					<title>X</title>
					<path
						fill="currentColor"
						d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
					/>
				</svg>
				<span>X</span>
			</a>
			<a
				href={shareData.facebook}
				target="_blank"
				rel="noopener noreferrer"
				className={shareActionClass}
				aria-label="Share on Facebook"
			>
				<svg
					role="img"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					className="h-4 w-4"
					aria-hidden="true"
				>
					<title>Facebook</title>
					<path
						fill="currentColor"
						d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
					/>
				</svg>
				<span>Facebook</span>
			</a>
			<a
				href={shareData.linkedin}
				target="_blank"
				rel="noopener noreferrer"
				className={shareActionClass}
				aria-label="Share on LinkedIn"
			>
				<LinkedinIcon className="h-4 w-4" aria-hidden="true" />
				<span>LinkedIn</span>
			</a>
			<button
				type="button"
				onClick={handleCopyLink}
				className={shareActionClass}
				aria-label="Copy link to clipboard"
			>
				<LinkIcon className="h-4 w-4" aria-hidden="true" />
				<span>Copy Link</span>
			</button>
		</div>
	)
}

export function FoundationDetailClientWrapper({
	slug,
}: FoundationDetailClientWrapperProps) {
	const {
		data: foundation,
		isLoading,
		error,
	} = useSupabaseQuery(
		'foundation',
		(client) => getFoundationBySlug(client, slug),
		{
			additionalKeyValues: [slug],
		},
	)

	const yearFounded = useMemo(
		() =>
			foundation && foundation.foundedYear > 0 ? foundation.foundedYear : null,
		[foundation],
	)

	const formattedDonations = useMemo(
		() =>
			foundation
				? new Intl.NumberFormat('en-US', {
						style: 'currency',
						currency: 'USD',
						minimumFractionDigits: 0,
						maximumFractionDigits: 0,
					}).format(foundation.totalDonationsReceived)
				: '$0',
		[foundation],
	)

	const shareUrl = useMemo(
		() =>
			typeof window !== 'undefined'
				? window.location.href
				: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/foundations/${slug}`,
		[slug],
	)

	const campaignsWithSlug = useMemo(
		() =>
			foundation?.campaigns?.filter((c): c is typeof c & { slug: string } =>
				Boolean(c.slug),
			) ?? [],
		[foundation?.campaigns],
	)

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

	const shouldReduceMotion = useReducedMotion()
	const { data: session } = useSession()
	const isFounder =
		Boolean(session?.user?.id) && session?.user?.id === foundation?.founderId

	if (isLoading) {
		return (
			<div className="space-y-8">
				<div className="relative h-64 w-full animate-pulse overflow-hidden rounded-2xl border border-border bg-card md:h-96" />
				<div className="space-y-6">
					<div className="h-12 w-1/2 animate-pulse rounded-lg bg-muted" />
					<div className="h-6 w-2/3 animate-pulse rounded-lg bg-muted" />
					<div className="grid gap-4 md:grid-cols-3">
						{[1, 2, 3].map((i) => (
							<div
								key={`skeleton-${i}`}
								className="h-24 animate-pulse rounded-xl border border-border bg-card"
							/>
						))}
					</div>
				</div>
			</div>
		)
	}

	if (error || !foundation) {
		return (
			<div className="rounded-2xl border border-border bg-card px-6 py-16 text-center">
				<Building2
					className="mx-auto mb-4 h-14 w-14 text-muted-foreground"
					aria-hidden="true"
				/>
				<h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
					Foundation not found
				</h2>
				<p className="mx-auto mt-2 max-w-md text-muted-foreground">
					This profile may have been removed or the link is incorrect.
				</p>
				<Button asChild className="mt-6">
					<Link href="/foundations">Back to foundations</Link>
				</Button>
			</div>
		)
	}

	return (
		<div className="space-y-10 sm:space-y-12">
			<nav aria-label="Breadcrumb">
				<Link
					href="/foundations"
					className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md"
				>
					<ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
					All foundations
				</Link>
			</nav>

			<div className="relative">
				{foundation.coverImageUrl ? (
					<div className="relative h-64 w-full overflow-hidden rounded-2xl border border-border md:h-96">
						<Image
							src={foundation.coverImageUrl}
							alt=""
							fill
							className="object-cover"
							priority
							sizes="(max-width: 1152px) 100vw, 72rem"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
					</div>
				) : (
					<div className="relative h-64 w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/25 via-muted to-primary/10 md:h-96">
						<div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
					</div>
				)}
			</div>

			<div className="flex flex-col items-start gap-8 md:flex-row md:items-center">
				{foundation.logoUrl ? (
					<div className="mx-auto shrink-0 md:mx-0">
						<div className="relative h-32 w-32 overflow-hidden rounded-2xl border-4 border-card bg-card shadow-lg ring-2 ring-border md:h-40 md:w-40">
							<Image
								src={foundation.logoUrl}
								alt={`${foundation.name} logo`}
								fill
								className="object-cover p-3"
								sizes="(max-width: 768px) 128px, 160px"
							/>
						</div>
					</div>
				) : (
					<div className="mx-auto shrink-0 md:mx-0">
						<div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border-4 border-card bg-gradient-to-br from-primary to-primary/70 shadow-lg ring-2 ring-border md:h-40 md:w-40">
							<Building2
								className="h-16 w-16 text-primary-foreground md:h-20 md:w-20"
								aria-hidden="true"
							/>
						</div>
					</div>
				)}

				<div className="min-w-0 flex-1 text-center md:text-left">
					<div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
						<div className="min-w-0 flex-1">
							<h1 className="mb-3 text-3xl font-bold tracking-tight text-balance gradient-text md:text-5xl">
								{foundation.name}
							</h1>
							<p className="mb-6 text-lg leading-relaxed text-muted-foreground md:text-xl">
								{foundation.description}
							</p>
						</div>
					</div>

					{isFounder ? (
						<div className="mb-6">
							<Button asChild>
								<Link href={`/foundations/${slug}/manage`}>
									<Settings2 className="mr-2 h-4 w-4" aria-hidden="true" />
									Manage foundation
								</Link>
							</Button>
						</div>
					) : null}

					<div className="mb-6">
						<div className="mb-3 flex items-center gap-3">
							<Share2
								className="h-5 w-5 text-muted-foreground"
								aria-hidden="true"
							/>
							<span className="text-sm font-medium text-muted-foreground">
								Share
							</span>
						</div>
						<SocialShareButtons
							url={shareUrl}
							title={foundation.name}
							description={foundation.description}
						/>
					</div>

					<div className="flex flex-wrap justify-center gap-4 md:justify-start md:gap-6">
						{yearFounded != null ? (
							<div className="flex items-center gap-2 text-muted-foreground">
								<Calendar
									className="h-5 w-5 shrink-0 text-primary"
									aria-hidden="true"
								/>
								<span className="text-sm md:text-base">
									Founded{' '}
									<strong className="font-bold tabular-nums text-foreground">
										{yearFounded}
									</strong>
								</span>
							</div>
						) : null}
						<div className="flex items-center gap-2 text-muted-foreground">
							<CheckCircle2
								className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400"
								aria-hidden="true"
							/>
							<span className="text-sm md:text-base">
								<strong className="font-bold tabular-nums text-foreground">
									{foundation.totalCampaignsCompleted}
								</strong>{' '}
								completed
							</span>
						</div>
						{foundation.totalCampaignsOpen > 0 ? (
							<div className="flex items-center gap-2 text-muted-foreground">
								<Users
									className="h-5 w-5 shrink-0 text-primary"
									aria-hidden="true"
								/>
								<span className="text-sm md:text-base">
									<strong className="font-bold tabular-nums text-foreground">
										{foundation.totalCampaignsOpen}
									</strong>{' '}
									active
								</span>
							</div>
						) : null}
						<div className="flex items-center gap-2 text-muted-foreground">
							<Heart
								className="h-5 w-5 shrink-0 text-primary"
								aria-hidden="true"
							/>
							<span className="text-sm md:text-base">
								<strong className="font-bold tabular-nums text-foreground">
									{formattedDonations}
								</strong>{' '}
								raised
							</span>
						</div>
					</div>
				</div>
			</div>

			{(foundation.mission || foundation.vision) && (
				<div className="grid gap-6 md:grid-cols-2">
					{foundation.mission && (
						<motion.div
							initial={
								shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }
							}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: shouldReduceMotion ? 0 : 0.1 }}
						>
							<Card className="h-full border-border bg-card shadow-sm transition-shadow hover:shadow-md">
								<CardContent className="p-6 md:p-8">
									<div className="mb-4 flex items-center gap-3">
										<div className="rounded-lg bg-primary/10 p-2">
											<Target
												className="h-5 w-5 text-primary"
												aria-hidden="true"
											/>
										</div>
										<h2 className="text-2xl font-bold tracking-tight">
											Mission
										</h2>
									</div>
									<p className="leading-relaxed text-muted-foreground">
										{foundation.mission}
									</p>
								</CardContent>
							</Card>
						</motion.div>
					)}
					{foundation.vision && (
						<motion.div
							initial={
								shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }
							}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: shouldReduceMotion ? 0 : 0.2 }}
						>
							<Card className="h-full border-border bg-card shadow-sm transition-shadow hover:shadow-md">
								<CardContent className="p-6 md:p-8">
									<div className="mb-4 flex items-center gap-3">
										<div className="rounded-lg bg-primary/10 p-2">
											<Eye
												className="h-5 w-5 text-primary"
												aria-hidden="true"
											/>
										</div>
										<h2 className="text-2xl font-bold tracking-tight">
											Vision
										</h2>
									</div>
									<p className="leading-relaxed text-muted-foreground">
										{foundation.vision}
									</p>
								</CardContent>
							</Card>
						</motion.div>
					)}
				</div>
			)}

			{foundation.milestones && foundation.milestones.length > 0 && (
				<motion.div
					initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: shouldReduceMotion ? 0 : 0.3 }}
				>
					<div className="mb-6 flex items-center gap-3">
						<TrendingUp
							className="h-6 w-6 text-primary"
							aria-hidden="true"
						/>
						<h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
							Key milestones
						</h2>
					</div>
					<div className="grid gap-4 md:grid-cols-2">
						{foundation.milestones.map((milestone, index) => (
							<motion.div
								key={milestone.id}
								initial={
									shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -20 }
								}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: shouldReduceMotion ? 0 : 0.1 * index }}
							>
								<Card className="h-full border-l-4 border-l-primary transition-shadow hover:shadow-md">
									<CardContent className="p-6">
										<div className="mb-3 flex items-start justify-between gap-4">
											<h3 className="flex-1 text-lg font-semibold">
												{milestone.title}
											</h3>
											<Badge variant="outline" className="shrink-0">
												{new Intl.DateTimeFormat('en-US', {
													year: 'numeric',
													month: 'short',
													day: 'numeric',
												}).format(new Date(milestone.achievedDate))}
											</Badge>
										</div>
										{milestone.description && (
											<p className="mb-3 text-sm text-muted-foreground">
												{milestone.description}
											</p>
										)}
										{milestone.impactMetric && (
											<div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
												<CheckCircle2 className="h-4 w-4" aria-hidden="true" />
												<span>{milestone.impactMetric}</span>
											</div>
										)}
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>
				</motion.div>
			)}

			{campaignsWithSlug.length > 0 ? (
				<motion.div
					initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: shouldReduceMotion ? 0 : 0.35 }}
				>
					<div className="mb-6 flex items-center gap-3">
						<Megaphone className="h-6 w-6 text-primary" aria-hidden="true" />
						<h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
							Campaigns
						</h2>
					</div>
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{campaignsWithSlug.map((campaign, index) => (
							<motion.div
								key={campaign.id}
								initial={
									shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }
								}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: shouldReduceMotion ? 0 : 0.05 * index }}
							>
								<Link
									href={`/projects/${campaign.slug}`}
									className="block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
								>
									<Card className="group h-full overflow-hidden border-border transition-[box-shadow,border-color] hover:border-primary/25 hover:shadow-md">
										<CardContent className="p-6">
											<h3 className="mb-2 line-clamp-2 text-lg font-semibold transition-colors group-hover:text-primary">
												{campaign.title}
											</h3>
											{campaign.description ? (
												<p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
													{campaign.description}
												</p>
											) : null}
											<div className="space-y-2">
												<div className="flex justify-between text-sm">
													<span className="text-muted-foreground">Raised</span>
													<span className="font-semibold tabular-nums">
														{new Intl.NumberFormat('en-US', {
															style: 'currency',
															currency: 'USD',
															minimumFractionDigits: 0,
															maximumFractionDigits: 0,
														}).format(campaign.raised)}{' '}
														/{' '}
														{new Intl.NumberFormat('en-US', {
															style: 'currency',
															currency: 'USD',
															minimumFractionDigits: 0,
															maximumFractionDigits: 0,
														}).format(campaign.goal)}
													</span>
												</div>
												<div className="h-2 overflow-hidden rounded-full bg-muted">
													<div
														className="h-full rounded-full bg-primary transition-all duration-300"
														style={{
															width: `${Math.min(100, campaign.percentageComplete)}%`,
														}}
													/>
												</div>
											</div>
											<div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
												<Users className="h-4 w-4 shrink-0" aria-hidden="true" />
												<span className="tabular-nums">
													{campaign.investors} supporters
												</span>
												<span className="ml-auto inline-flex items-center gap-1">
													View
													<ArrowRight
														className="h-4 w-4 transition-transform group-hover:translate-x-1"
														aria-hidden="true"
													/>
												</span>
											</div>
										</CardContent>
									</Card>
								</Link>
							</motion.div>
						))}
					</div>
				</motion.div>
			) : null}

			<div className="grid gap-6 md:grid-cols-2">
				{foundation.founder && (
					<motion.div
						initial={
							shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }
						}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: shouldReduceMotion ? 0 : 0.4 }}
					>
						<Card className="h-full border-border shadow-sm">
							<CardContent className="p-6 md:p-8">
								<h2 className="mb-6 text-2xl font-bold tracking-tight">Founder</h2>
								<div className="flex items-start gap-4">
									{foundation.founder.imageUrl ? (
										foundation.founder.slug ? (
											<Link
												href={`/u/${foundation.founder.slug}`}
												className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full ring-2 ring-border transition-shadow hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
											>
												<Image
													src={foundation.founder.imageUrl}
													alt=""
													fill
													className="object-cover"
													sizes="80px"
												/>
											</Link>
										) : (
											<div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full ring-2 ring-border">
												<Image
													src={foundation.founder.imageUrl}
													alt=""
													fill
													className="object-cover"
													sizes="80px"
												/>
											</div>
										)
									) : (
										<div className="h-20 w-20 shrink-0 rounded-full bg-muted ring-2 ring-border" />
									)}
									<div className="min-w-0 flex-1">
										{foundation.founder.slug ? (
											<Link
												href={`/u/${foundation.founder.slug}`}
												className="mb-2 block rounded text-xl font-bold transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
											>
												{foundation.founder.displayName || 'Anonymous'}
											</Link>
										) : (
											<p className="mb-2 text-xl font-bold">
												{foundation.founder.displayName || 'Anonymous'}
											</p>
										)}
										{foundation.founder.bio && (
											<p className="text-sm leading-relaxed text-muted-foreground">
												{foundation.founder.bio}
											</p>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				)}

				{(foundation.websiteUrl ||
					Object.keys(foundation.socialLinks).length > 0) && (
					<motion.div
						initial={
							shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }
						}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: shouldReduceMotion ? 0 : 0.5 }}
					>
						<Card className="h-full border-border shadow-sm">
							<CardContent className="p-6 md:p-8">
								<h2 className="mb-6 text-2xl font-bold tracking-tight">Connect</h2>
								<div className="flex flex-col gap-3">
									{foundation.websiteUrl && (
										<a
											href={foundation.websiteUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="group flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
										>
											<div className="rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary/15">
												<Globe
													className="h-5 w-5 text-primary"
													aria-hidden="true"
												/>
											</div>
											<span className="flex-1 font-medium">Website</span>
											<ArrowRight
												className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary"
												aria-hidden="true"
											/>
										</a>
									)}
									{Object.entries(foundation.socialLinks).map(
										([platform, url]) => {
											const Icon = getSocialIcon(platform)
											return (
												<a
													key={platform}
													href={url}
													target="_blank"
													rel="noopener noreferrer"
													className="group flex items-center gap-3 rounded-xl border border-border p-3 capitalize transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
												>
													<div className="rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary/15">
														<Icon
															className="h-5 w-5 text-primary"
															aria-hidden="true"
														/>
													</div>
													<span className="flex-1 font-medium">{platform}</span>
													<ArrowRight
														className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary"
														aria-hidden="true"
													/>
												</a>
											)
										},
									)}
								</div>
							</CardContent>
						</Card>
					</motion.div>
				)}
			</div>
		</div>
	)
}
