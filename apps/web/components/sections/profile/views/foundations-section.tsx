'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { motion, useReducedMotion } from 'framer-motion'
import {
	ArrowRight,
	Building2,
	CheckCircle2,
	Heart,
	Plus,
	Settings,
	Users,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo } from 'react'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { staggerContainer } from '~/lib/constants/animations'
import { getUserFoundations } from '~/lib/queries/foundations/get-user-foundations'

interface FoundationsSectionProps {
	userId: string
}

const cardVariants = {
	hidden: { opacity: 0, y: 20 },
	show: {
		opacity: 1,
		y: 0,
		transition: {
			type: 'spring',
			stiffness: 100,
			damping: 12,
		},
	},
}

export function FoundationsSection({ userId }: FoundationsSectionProps) {
	const {
		data: foundations = [],
		isLoading,
		error,
	} = useSupabaseQuery(
		'user-foundations',
		(client) => getUserFoundations(client, userId),
		{
			additionalKeyValues: [userId],
		},
	)

	const shouldReduceMotion = useReducedMotion()

	const formattedFoundations = useMemo(
		() =>
			foundations.map((foundation) => ({
				...foundation,
				formattedDonations: new Intl.NumberFormat('en-US', {
					style: 'currency',
					currency: 'USD',
					minimumFractionDigits: 0,
					maximumFractionDigits: 0,
				}).format(foundation.totalDonationsReceived),
			})),
		[foundations],
	)

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<Card key={`skeleton-${i}`} className="border-0 shadow-lg">
							<CardContent className="p-6">
								<div className="h-48 bg-muted animate-pulse rounded-lg mb-4" />
								<div className="h-6 bg-muted animate-pulse rounded-lg mb-2" />
								<div className="h-4 bg-muted animate-pulse rounded-lg w-2/3" />
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<Card className="border-0 bg-red-50">
				<CardContent className="py-12 text-center text-red-600">
					Error loading foundations. Please try again.
				</CardContent>
			</Card>
		)
	}

	if (foundations.length === 0) {
		return (
			<Card className="border-0 bg-muted/50">
				<CardContent className="py-16 text-center">
					<Building2
						className="h-16 w-16 text-muted-foreground mx-auto mb-4"
						aria-hidden="true"
					/>
					<h3 className="text-xl font-semibold mb-2">No Foundations Yet</h3>
					<p className="text-muted-foreground mb-6">
						Create a foundation to build trust and organize your campaigns under
						one umbrella.
					</p>
					<Button asChild>
						<Link href="/create-foundation">
							<Plus className="h-4 w-4 mr-2" aria-hidden="true" />
							Create Your First Foundation
						</Link>
					</Button>
				</CardContent>
			</Card>
		)
	}

	return (
		<motion.div
			variants={staggerContainer}
			initial="initial"
			animate="animate"
			className="space-y-4"
		>
			<motion.div
				variants={staggerContainer}
				initial="initial"
				animate="animate"
				className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
			>
				{formattedFoundations.map((foundation, index) => (
					<motion.div
						key={foundation.id}
						variants={cardVariants}
						custom={index}
						whileHover={shouldReduceMotion ? {} : { y: -8, scale: 1.02 }}
						transition={{ type: 'spring', stiffness: 300 }}
					>
						<FoundationCard foundation={foundation} />
					</motion.div>
				))}
			</motion.div>
		</motion.div>
	)
}

function FoundationCard({
	foundation,
}: {
	foundation: {
		id: string
		name: string
		slug: string
		description: string | null
		logoUrl: string | null
		coverImageUrl: string | null
		totalDonationsReceived: number
		totalCampaignsCompleted: number
		totalCampaignsOpen: number
		formattedDonations: string
	}
}) {
	const shouldReduceMotion = useReducedMotion()
	const hasActiveCampaigns = foundation.totalCampaignsOpen > 0

	return (
		<Card className="border-0 overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 h-full flex flex-col bg-card relative group">
			{/* Decorative overlay */}
			<div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/5 transition-colors duration-300 pointer-events-none" />

			{/* Cover Image or Logo */}
			{foundation.coverImageUrl ? (
				<motion.div
					className="relative h-48 w-full overflow-hidden"
					whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
					transition={{ duration: 0.3 }}
				>
					<Image
						src={foundation.coverImageUrl}
						alt=""
						fill
						className="object-cover"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
						loading="lazy"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
					{foundation.logoUrl && (
						<div className="absolute bottom-4 left-4">
							<div className="relative h-16 w-16 overflow-hidden rounded-xl border-2 border-white bg-white shadow-lg">
								<Image
									src={foundation.logoUrl}
									alt={`${foundation.name} logo`}
									fill
									className="object-cover p-2"
									sizes="64px"
								/>
							</div>
						</div>
					)}
					{hasActiveCampaigns && (
						<div className="absolute top-4 right-4">
							<Badge className="bg-green-500 text-white border-0 shadow-lg">
								<span className="relative flex h-2 w-2 mr-1.5">
									<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
									<span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
								</span>
								Active
							</Badge>
						</div>
					)}
				</motion.div>
			) : foundation.logoUrl ? (
				<div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-pink-500/20 flex items-center justify-center p-8">
					<div className="relative h-32 w-32 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-xl">
						<Image
							src={foundation.logoUrl}
							alt={`${foundation.name} logo`}
							fill
							className="object-cover p-3"
							sizes="128px"
						/>
					</div>
				</div>
			) : (
				<div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-purple-500/30 via-blue-500/30 to-pink-500/30 flex items-center justify-center">
					<Building2 className="h-20 w-20 text-white/50" aria-hidden="true" />
				</div>
			)}

			<CardHeader className="relative z-10">
				<CardTitle className="text-lg line-clamp-2 font-bold text-wrap-balance min-w-0">
					{foundation.name}
				</CardTitle>
			</CardHeader>

			<CardContent className="flex-1 flex flex-col gap-4 relative z-10">
				{foundation.description && (
					<p className="text-sm text-muted-foreground line-clamp-2 min-w-0">
						{foundation.description}
					</p>
				)}

				{/* Stats */}
				<div className="grid grid-cols-3 gap-3 py-3 border-y border-gray-100">
					<div className="text-center">
						<div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
							<Heart className="h-4 w-4" aria-hidden="true" />
						</div>
						<p className="text-xs font-bold tabular-nums">
							{foundation.formattedDonations}
						</p>
						<p className="text-xs text-muted-foreground">Raised</p>
					</div>
					<div className="text-center">
						<div className="flex items-center justify-center gap-1 text-green-600 mb-1">
							<CheckCircle2 className="h-4 w-4" aria-hidden="true" />
						</div>
						<p className="text-xs font-bold tabular-nums">
							{foundation.totalCampaignsCompleted}
						</p>
						<p className="text-xs text-muted-foreground">Completed</p>
					</div>
					<div className="text-center">
						<div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
							<Users className="h-4 w-4" aria-hidden="true" />
						</div>
						<p className="text-xs font-bold tabular-nums">
							{foundation.totalCampaignsOpen}
						</p>
						<p className="text-xs text-muted-foreground">Active</p>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex gap-2 mt-auto">
					<motion.div
						whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
						whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
						className="flex-1"
					>
						<Button
							asChild
							variant="outline"
							className="w-full border-border hover:bg-muted focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
						>
							<Link href={`/foundations/${foundation.slug}`}>
								View Foundation
								<ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
							</Link>
						</Button>
					</motion.div>
					<motion.div
						whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
						whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
						className="flex-1"
					>
						<Button
							asChild
							variant="outline"
							className="w-full border-border hover:bg-muted focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
						>
							<Link href={`/foundations/${foundation.slug}/manage`}>
								<Settings className="h-4 w-4 mr-2" aria-hidden="true" />
								Manage
							</Link>
						</Button>
					</motion.div>
				</div>
			</CardContent>
		</Card>
	)
}
