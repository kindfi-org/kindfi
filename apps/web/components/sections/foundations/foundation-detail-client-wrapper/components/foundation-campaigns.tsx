'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Megaphone, Users } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '~/components/base/card'
import type { getFoundationBySlug } from '~/lib/queries/foundations/get-foundation-by-slug'

type Foundation = NonNullable<Awaited<ReturnType<typeof getFoundationBySlug>>>
type CampaignWithSlug = NonNullable<Foundation['campaigns']>[number] & {
	slug: string
}

interface FoundationCampaignsProps {
	campaigns: CampaignWithSlug[]
	shouldReduceMotion: boolean | null
}

export function FoundationCampaigns({ campaigns, shouldReduceMotion }: FoundationCampaignsProps) {
	if (!campaigns.length) {
		return null
	}

	return (
		<motion.div
			initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: shouldReduceMotion ? 0 : 0.35 }}
		>
			<div className="mb-6 flex items-center gap-3">
				<Megaphone className="h-6 w-6 text-primary" aria-hidden="true" />
				<h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Campaigns</h2>
			</div>
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{campaigns.map((campaign, index) => (
					<motion.div
						key={campaign.id}
						initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
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
										<span className="tabular-nums">{campaign.investors} supporters</span>
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
	)
}
