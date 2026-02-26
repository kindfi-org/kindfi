'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { motion, useReducedMotion } from 'framer-motion'
import {
	ArrowRight,
	Building2,
	Calendar,
	CheckCircle2,
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
				className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
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
				className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
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
				className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
				aria-label="Share on LinkedIn"
			>
				<LinkedinIcon className="h-4 w-4" aria-hidden="true" />
				<span>LinkedIn</span>
			</a>
			<button
				type="button"
				onClick={handleCopyLink}
				className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
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
				<div className="relative h-80 md:h-96 w-full overflow-hidden rounded-2xl bg-muted animate-pulse" />
				<div className="space-y-6">
					<div className="h-12 bg-muted animate-pulse rounded-lg w-1/2" />
					<div className="h-6 bg-muted animate-pulse rounded-lg w-2/3" />
					<div className="grid md:grid-cols-3 gap-4">
						{[1, 2, 3].map((i) => (
							<div
								key={`skeleton-${i}`}
								className="h-24 bg-muted animate-pulse rounded-lg"
							/>
						))}
					</div>
				</div>
			</div>
		)
	}

	if (error || !foundation) {
		return (
			<div className="text-center py-16">
				<Building2
					className="h-16 w-16 text-muted-foreground mx-auto mb-4"
					aria-hidden="true"
				/>
				<h2 className="text-2xl font-bold mb-2">Foundation Not Found</h2>
				<p className="text-muted-foreground mb-6">
					The foundation you&apos;re looking for doesn&apos;t exist or has been
					removed.
				</p>
				<Button asChild>
					<Link href="/foundations">Browse All Foundations</Link>
				</Button>
			</div>
		)
	}

	return (
		<div className="space-y-8">
			{/* Hero Section with Cover Image */}
			<div className="relative">
				{foundation.coverImageUrl ? (
					<div className="relative h-64 md:h-96 w-full overflow-hidden rounded-2xl">
						<Image
							src={foundation.coverImageUrl}
							alt=""
							fill
							className="object-cover"
							priority
							sizes="100vw"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
					</div>
				) : (
					<div className="relative h-64 md:h-96 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600">
						<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
					</div>
				)}
			</div>

			{/* Foundation Header with Logo */}
			<div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
				{/* Logo - Prominent Display */}
				{foundation.logoUrl ? (
					<div className="flex-shrink-0 mx-auto md:mx-0">
						<div className="relative h-32 w-32 md:h-40 md:w-40 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-2xl ring-8 ring-purple-50">
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
					<div className="flex-shrink-0 mx-auto md:mx-0">
						<div className="relative h-32 w-32 md:h-40 md:w-40 overflow-hidden rounded-2xl border-4 border-white bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 shadow-2xl ring-8 ring-purple-50 flex items-center justify-center">
							<Building2
								className="h-16 w-16 md:h-20 md:w-20 text-white"
								aria-hidden="true"
							/>
						</div>
					</div>
				)}

				{/* Foundation Info */}
				<div className="flex-1 min-w-0 text-center md:text-left">
					<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
						<div className="flex-1 min-w-0">
							<h1 className="text-3xl md:text-5xl font-extrabold mb-3 text-wrap-balance">
								{foundation.name}
							</h1>
							{/* Full Description - No Truncation */}
							<p className="text-muted-foreground text-lg md:text-xl mb-6 leading-relaxed">
								{foundation.description}
							</p>
						</div>
					</div>

					{isFounder ? (
						<div className="mb-6">
							<Button
								asChild
								className="focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
							>
								<Link href={`/foundations/${slug}/manage`}>
									<Settings2 className="h-4 w-4 mr-2" aria-hidden="true" />
									Manage &amp; edit foundation
								</Link>
							</Button>
						</div>
					) : null}

					{/* Share Buttons */}
					<div className="mb-6">
						<div className="flex items-center gap-3 mb-3">
							<Share2
								className="h-5 w-5 text-muted-foreground"
								aria-hidden="true"
							/>
							<span className="text-sm font-medium text-muted-foreground">
								Share this foundation:
							</span>
						</div>
						<SocialShareButtons
							url={shareUrl}
							title={foundation.name}
							description={foundation.description}
						/>
					</div>

					{/* Quick Stats */}
					<div className="flex flex-wrap gap-4 md:gap-6 justify-center md:justify-start">
						{yearFounded != null ? (
							<div className="flex items-center gap-2 text-muted-foreground">
								<Calendar
									className="h-5 w-5 text-purple-600"
									aria-hidden="true"
								/>
								<span className="text-sm md:text-base">
									Founded{' '}
									<strong className="font-bold tabular-nums">
										{yearFounded}
									</strong>
								</span>
							</div>
						) : null}
						<div className="flex items-center gap-2 text-muted-foreground">
							<CheckCircle2
								className="h-5 w-5 text-green-600"
								aria-hidden="true"
							/>
							<span className="text-sm md:text-base">
								<strong className="font-bold tabular-nums">
									{foundation.totalCampaignsCompleted}
								</strong>{' '}
								completed
							</span>
						</div>
						{foundation.totalCampaignsOpen > 0 && (
							<div className="flex items-center gap-2 text-muted-foreground">
								<Users className="h-5 w-5 text-blue-600" aria-hidden="true" />
								<span className="text-sm md:text-base">
									<strong className="font-bold tabular-nums">
										{foundation.totalCampaignsOpen}
									</strong>{' '}
									active campaigns
								</span>
							</div>
						)}
						<div className="flex items-center gap-2 text-muted-foreground">
							<Heart className="h-5 w-5 text-pink-600" aria-hidden="true" />
							<span className="text-sm md:text-base">
								<strong className="font-bold tabular-nums">
									{formattedDonations}
								</strong>{' '}
								raised
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Mission & Vision Cards */}
			{(foundation.mission || foundation.vision) && (
				<div className="grid md:grid-cols-2 gap-6">
					{foundation.mission && (
						<motion.div
							initial={
								shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }
							}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: shouldReduceMotion ? 0 : 0.1 }}
						>
							<Card className="h-full border-2 border-purple-100 bg-gradient-to-br from-purple-50/50 to-white hover:shadow-lg transition-shadow">
								<CardContent className="p-6 md:p-8">
									<div className="flex items-center gap-3 mb-4">
										<div className="p-2 rounded-lg bg-purple-100">
											<Target
												className="h-5 w-5 text-purple-600"
												aria-hidden="true"
											/>
										</div>
										<h2 className="text-2xl font-bold">Mission</h2>
									</div>
									<p className="text-muted-foreground leading-relaxed">
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
							<Card className="h-full border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 to-white hover:shadow-lg transition-shadow">
								<CardContent className="p-6 md:p-8">
									<div className="flex items-center gap-3 mb-4">
										<div className="p-2 rounded-lg bg-blue-100">
											<Eye
												className="h-5 w-5 text-blue-600"
												aria-hidden="true"
											/>
										</div>
										<h2 className="text-2xl font-bold">Vision</h2>
									</div>
									<p className="text-muted-foreground leading-relaxed">
										{foundation.vision}
									</p>
								</CardContent>
							</Card>
						</motion.div>
					)}
				</div>
			)}

			{/* Milestones */}
			{foundation.milestones && foundation.milestones.length > 0 && (
				<motion.div
					initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: shouldReduceMotion ? 0 : 0.3 }}
				>
					<div className="flex items-center gap-3 mb-6">
						<TrendingUp
							className="h-6 w-6 text-purple-600"
							aria-hidden="true"
						/>
						<h2 className="text-3xl font-bold">Key Milestones</h2>
					</div>
					<div className="grid md:grid-cols-2 gap-4">
						{foundation.milestones.map((milestone, index) => (
							<motion.div
								key={milestone.id}
								initial={
									shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -20 }
								}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: shouldReduceMotion ? 0 : 0.1 * index }}
							>
								<Card className="h-full hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
									<CardContent className="p-6">
										<div className="flex items-start justify-between gap-4 mb-3">
											<h3 className="text-lg font-semibold flex-1">
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
											<p className="text-sm text-muted-foreground mb-3">
												{milestone.description}
											</p>
										)}
										{milestone.impactMetric && (
											<div className="flex items-center gap-2 text-green-600 font-semibold">
												<CheckCircle2 className="h-4 w-4" aria-hidden="true" />
												<span className="text-sm">
													{milestone.impactMetric}
												</span>
											</div>
										)}
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>
				</motion.div>
			)}

			{/* Campaigns */}
			{campaignsWithSlug.length > 0 ? (
				<motion.div
					initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: shouldReduceMotion ? 0 : 0.35 }}
				>
					<div className="flex items-center gap-3 mb-6">
						<Megaphone className="h-6 w-6 text-purple-600" aria-hidden="true" />
						<h2 className="text-3xl font-bold">Campaigns</h2>
					</div>
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
									className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 rounded-xl"
								>
									<Card className="h-full hover:shadow-lg transition-[box-shadow] border-2 border-transparent hover:border-purple-200 overflow-hidden group">
										<CardContent className="p-6">
											<h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
												{campaign.title}
											</h3>
											{campaign.description ? (
												<p className="text-sm text-muted-foreground line-clamp-2 mb-4">
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
												<div className="h-2 rounded-full bg-muted overflow-hidden">
													<div
														className="h-full rounded-full bg-purple-500 transition-all duration-300"
														style={{
															width: `${Math.min(100, campaign.percentageComplete)}%`,
														}}
													/>
												</div>
											</div>
											<div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
												<Users className="h-4 w-4" aria-hidden="true" />
												<span className="tabular-nums">
													{campaign.investors} supporters
												</span>
												<span className="ml-auto inline-flex items-center gap-1">
													View campaign
													<ArrowRight
														className="h-4 w-4 group-hover:translate-x-1 transition-transform"
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

			{/* Founder & Connect Section */}
			<div className="grid md:grid-cols-2 gap-6">
				{/* Founder */}
				{foundation.founder && (
					<motion.div
						initial={
							shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }
						}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: shouldReduceMotion ? 0 : 0.4 }}
					>
						<Card className="h-full">
							<CardContent className="p-6 md:p-8">
								<h2 className="text-2xl font-bold mb-6">Founder</h2>
								<div className="flex items-start gap-4">
									{foundation.founder.imageUrl ? (
										<Link
											href={
												foundation.founder.slug
													? `/u/${foundation.founder.slug}`
													: '#'
											}
											className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full ring-4 ring-purple-100 hover:ring-purple-200 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
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
										<div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex-shrink-0 ring-4 ring-purple-100" />
									)}
									<div className="flex-1 min-w-0">
										{foundation.founder.slug ? (
											<Link
												href={`/u/${foundation.founder.slug}`}
												className="text-xl font-bold hover:text-purple-600 transition-colors block mb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1 rounded"
											>
												{foundation.founder.displayName || 'Anonymous'}
											</Link>
										) : (
											<p className="text-xl font-bold mb-2">
												{foundation.founder.displayName || 'Anonymous'}
											</p>
										)}
										{foundation.founder.bio && (
											<p className="text-muted-foreground text-sm leading-relaxed">
												{foundation.founder.bio}
											</p>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				)}

				{/* Connect Links */}
				{(foundation.websiteUrl ||
					Object.keys(foundation.socialLinks).length > 0) && (
					<motion.div
						initial={
							shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }
						}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: shouldReduceMotion ? 0 : 0.5 }}
					>
						<Card className="h-full">
							<CardContent className="p-6 md:p-8">
								<h2 className="text-2xl font-bold mb-6">Connect</h2>
								<div className="flex flex-col gap-3">
									{foundation.websiteUrl && (
										<a
											href={foundation.websiteUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-3 p-3 rounded-lg border hover:bg-purple-50 hover:border-purple-200 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
										>
											<div className="p-2 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
												<Globe
													className="h-5 w-5 text-purple-600"
													aria-hidden="true"
												/>
											</div>
											<span className="font-medium flex-1">Visit Website</span>
											<ArrowRight
												className="h-4 w-4 text-muted-foreground group-hover:text-purple-600 group-hover:translate-x-1 transition-all"
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
													className="flex items-center gap-3 p-3 rounded-lg border hover:bg-purple-50 hover:border-purple-200 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 capitalize"
												>
													<div className="p-2 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
														<Icon
															className="h-5 w-5 text-purple-600"
															aria-hidden="true"
														/>
													</div>
													<span className="font-medium flex-1">{platform}</span>
													<ArrowRight
														className="h-4 w-4 text-muted-foreground group-hover:text-purple-600 group-hover:translate-x-1 transition-all"
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
