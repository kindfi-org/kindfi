'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Megaphone, Users } from 'lucide-react'
import Link from 'next/link'
import { useI18n } from '~/lib/i18n'
import type { getFoundationBySlug } from '~/lib/queries/foundations/get-foundation-by-slug'

type Foundation = NonNullable<Awaited<ReturnType<typeof getFoundationBySlug>>>
type CampaignWithSlug = NonNullable<Foundation['campaigns']>[number] & {
	slug: string
}

interface FoundationCampaignsProps {
	campaigns: CampaignWithSlug[]
	shouldReduceMotion: boolean | null
}

const formatUsd = (amount: number) =>
	new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount)

export function FoundationCampaigns({ campaigns, shouldReduceMotion }: FoundationCampaignsProps) {
	const { t } = useI18n()

	if (!campaigns.length) {
		return null
	}

	return (
		<motion.section
			initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: shouldReduceMotion ? 0 : 0.2, duration: 0.5 }}
			aria-labelledby="foundation-campaigns-heading"
		>
			<div className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-700/80">
						{t('foundations.campaignsEyebrow')}
					</p>
					<div className="flex items-center gap-3">
						<div className="rounded-xl bg-emerald-600/10 p-2">
							<Megaphone className="h-5 w-5 text-emerald-700" aria-hidden="true" />
						</div>
						<h2
							id="foundation-campaigns-heading"
							className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
						>
							{t('foundations.campaigns')}
						</h2>
					</div>
				</div>
				<p className="text-sm text-slate-500">
					{campaigns.length === 1
						? t('foundations.campaignsCountOne').replace('{count}', '1')
						: t('foundations.campaignsCountMany').replace('{count}', String(campaigns.length))}
				</p>
			</div>

			<div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
				{campaigns.map((campaign, index) => (
					<motion.div
						key={campaign.id}
						initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: shouldReduceMotion ? 0 : 0.05 * index, duration: 0.45 }}
					>
						<Link
							href={`/projects/${campaign.slug}`}
							className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
						>
							<article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-[box-shadow,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-emerald-200/80 hover:shadow-lg">
								<div className="h-1.5 w-full bg-slate-100">
									<div
										className="gradient-progress h-full transition-all duration-500"
										style={{
											width: `${Math.min(100, campaign.percentageComplete)}%`,
										}}
									/>
								</div>
								<div className="flex flex-1 flex-col p-5 sm:p-6">
									<h3 className="mb-2 line-clamp-2 text-lg font-semibold text-slate-900 transition-colors group-hover:text-emerald-800">
										{campaign.title}
									</h3>
									{campaign.description ? (
										<p className="mb-5 line-clamp-2 text-sm leading-relaxed text-slate-500">
											{campaign.description}
										</p>
									) : (
										<div className="mb-5" />
									)}

									<div className="mt-auto space-y-3">
										<div className="flex items-end justify-between gap-3">
											<div>
												<p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
													{t('foundations.raised')}
												</p>
												<p className="text-base font-bold tabular-nums text-slate-900">
													{formatUsd(campaign.raised)}
												</p>
											</div>
											<p className="text-sm tabular-nums text-slate-500">
												{t('foundations.ofGoal').replace('{goal}', formatUsd(campaign.goal))}
											</p>
										</div>

										<div className="flex items-center gap-2 text-sm text-slate-500">
											<Users className="h-4 w-4 shrink-0" aria-hidden="true" />
											<span className="tabular-nums">
												{t('foundations.supportersCount').replace(
													'{count}',
													String(campaign.investors),
												)}
											</span>
											<span className="ml-auto inline-flex items-center gap-1 font-medium text-emerald-700">
												{t('foundations.viewCampaign')}
												<ArrowRight
													className="h-4 w-4 transition-transform group-hover:translate-x-1"
													aria-hidden="true"
												/>
											</span>
										</div>
									</div>
								</div>
							</article>
						</Link>
					</motion.div>
				))}
			</div>
		</motion.section>
	)
}
