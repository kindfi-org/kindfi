'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Megaphone, Users } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '~/components/base/card'
import type { useFoundationDetail } from './use-foundation-detail'

type CampaignWithSlug = ReturnType<
	typeof useFoundationDetail
>['campaignsWithSlug'][number]

export function FoundationCampaignsSection({
	campaignsWithSlug,
	shouldReduceMotion,
}: {
	campaignsWithSlug: CampaignWithSlug[]
	shouldReduceMotion: boolean | null
}) {
	if (campaignsWithSlug.length === 0) {
		return null
	}

	return (
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
	)
}
