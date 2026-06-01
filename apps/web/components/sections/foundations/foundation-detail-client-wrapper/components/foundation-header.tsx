import { Building2, Calendar, CheckCircle2, Heart, Settings2, Share2, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '~/components/base/button'
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
	return (
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
						<Share2 className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
						<span className="text-sm font-medium text-muted-foreground">Share</span>
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
							<Calendar className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
							<span className="text-sm md:text-base">
								Founded{' '}
								<strong className="font-bold tabular-nums text-foreground">{yearFounded}</strong>
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
							<Users className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
							<span className="text-sm md:text-base">
								<strong className="font-bold tabular-nums text-foreground">
									{foundation.totalCampaignsOpen}
								</strong>{' '}
								active
							</span>
						</div>
					) : null}
					<div className="flex items-center gap-2 text-muted-foreground">
						<Heart className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
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
	)
}
