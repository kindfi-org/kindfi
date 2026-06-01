'use client'

import {
	Building2,
	Calendar,
	CheckCircle2,
	Heart,
	Settings2,
	Share2,
	Users,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '~/components/base/button'
import { SocialShareButtons } from './social-share-buttons'
import type { useFoundationDetail } from './use-foundation-detail'

type Foundation = NonNullable<
	ReturnType<typeof useFoundationDetail>['foundation']
>

export function FoundationDetailHeader({
	foundation,
	slug,
	yearFounded,
	formattedDonations,
	shareUrl,
	isFounder,
}: {
	foundation: Foundation
	slug: string
	yearFounded: number | null
	formattedDonations: string
	shareUrl: string
	isFounder: boolean
}) {
	return (
		<div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
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

			<div className="flex-1 min-w-0 text-center md:text-left">
				<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
					<div className="flex-1 min-w-0">
						<h1 className="text-3xl md:text-5xl font-extrabold mb-3 text-wrap-balance">
							{foundation.name}
						</h1>
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
	)
}
