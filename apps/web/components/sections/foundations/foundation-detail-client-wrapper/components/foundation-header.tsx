'use client'

import { Building2, Calendar, CheckCircle2, Heart, Settings2, Share2, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '~/components/base/button'
import { useI18n } from '~/lib/i18n'
import type { getFoundationBySlug } from '~/lib/queries/foundations/get-foundation-by-slug'
import { SocialShareButtons } from './social-share-buttons'

type Foundation = NonNullable<Awaited<ReturnType<typeof getFoundationBySlug>>>

interface FoundationHeaderProps {
	foundation: Foundation
	slug: string
	yearFounded: number | null
	formattedDonations: string
	shareUrl: string
	isFounder: boolean
}

export function FoundationHeader({
	foundation,
	slug,
	yearFounded,
	formattedDonations,
	shareUrl,
	isFounder,
}: FoundationHeaderProps) {
	const { t } = useI18n()

	return (
		<div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
			<div className="flex flex-col items-start gap-8 md:flex-row md:items-center">
				{foundation.logoUrl ? (
					<div className="mx-auto shrink-0 md:mx-0">
						<div className="relative h-32 w-32 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg ring-2 ring-slate-200/80 md:h-40 md:w-40">
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
						<div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-lg ring-2 ring-slate-200/80 md:h-40 md:w-40">
							<Building2 className="h-16 w-16 text-white md:h-20 md:w-20" aria-hidden="true" />
						</div>
					</div>
				)}

				<div className="min-w-0 flex-1 text-center md:text-left">
					<h1 className="mb-3 text-3xl font-bold tracking-tight text-balance text-slate-900 md:text-5xl">
						<span className="gradient-text">{foundation.name}</span>
					</h1>
					<p className="mb-6 text-lg leading-relaxed text-muted-foreground md:text-xl">
						{foundation.description}
					</p>

					{isFounder ? (
						<div className="mb-6 flex justify-center md:justify-start">
							<Button asChild className="gradient-btn rounded-full text-white">
								<Link href={`/foundations/${slug}/manage`}>
									<Settings2 className="mr-2 h-4 w-4" aria-hidden="true" />
									{t('foundations.manageFoundation')}
								</Link>
							</Button>
						</div>
					) : null}

					<div className="mb-6">
						<div className="mb-3 flex items-center justify-center gap-3 md:justify-start">
							<Share2 className="h-5 w-5 text-emerald-700" aria-hidden="true" />
							<span className="text-sm font-medium text-slate-700">{t('foundations.share')}</span>
						</div>
						<div className="flex justify-center md:justify-start">
							<SocialShareButtons
								url={shareUrl}
								title={foundation.name}
								description={foundation.description}
							/>
						</div>
					</div>

					<div className="flex flex-wrap justify-center gap-4 md:justify-start md:gap-6">
						{yearFounded != null ? (
							<div className="flex items-center gap-2 text-muted-foreground">
								<Calendar className="h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
								<span className="text-sm md:text-base">
									{t('foundations.founded')}{' '}
									<strong className="font-bold tabular-nums text-slate-900">{yearFounded}</strong>
								</span>
							</div>
						) : null}
						<div className="flex items-center gap-2 text-muted-foreground">
							<CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
							<span className="text-sm md:text-base">
								<strong className="font-bold tabular-nums text-slate-900">
									{foundation.totalCampaignsCompleted}
								</strong>{' '}
								{t('foundations.completedCampaigns')}
							</span>
						</div>
						{foundation.totalCampaignsOpen > 0 ? (
							<div className="flex items-center gap-2 text-muted-foreground">
								<Users className="h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
								<span className="text-sm md:text-base">
									<strong className="font-bold tabular-nums text-slate-900">
										{foundation.totalCampaignsOpen}
									</strong>{' '}
									{t('foundations.activeCampaigns')}
								</span>
							</div>
						) : null}
						<div className="flex items-center gap-2 text-muted-foreground">
							<Heart className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
							<span className="text-sm md:text-base">
								<strong className="font-bold tabular-nums text-slate-900">
									{formattedDonations}
								</strong>{' '}
								{t('foundations.raised')}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
