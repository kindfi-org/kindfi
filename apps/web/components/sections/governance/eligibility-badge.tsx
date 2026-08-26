'use client'

import { useQuery } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2, Loader2, Shield, Vote } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import type { EligibilityResult, NftTier } from '~/lib/governance/types'
import { TIER_COLORS, TIER_LABELS, TIER_VOTE_WEIGHTS } from '~/lib/governance/vote-weight'
import { useI18n } from '~/lib/i18n'
import { cn } from '~/lib/utils'

interface EligibilityResponse extends EligibilityResult {
	error?: string
}

const surfaceClass =
	'h-full rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm shadow-slate-200/50'

export function EligibilityBadge() {
	const { t } = useI18n()
	const { data: session, status: sessionStatus } = useSession()

	const { data, isLoading } = useQuery<EligibilityResponse>({
		queryKey: ['governance-eligibility', session?.user?.id],
		queryFn: async () => {
			const res = await fetch('/api/governance/eligibility')
			if (!res.ok) throw new Error('Failed to check eligibility')
			return res.json()
		},
		enabled: !!session?.user?.id,
		staleTime: 5 * 60_000,
	})

	if (sessionStatus === 'loading' || isLoading) {
		return (
			<div className={surfaceClass}>
				<div className="flex h-full items-center justify-center gap-2 py-4">
					<Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
					<span className="text-sm text-muted-foreground">
						{t('governancePage.eligibilityChecking')}
					</span>
				</div>
			</div>
		)
	}

	if (!session?.user?.id) {
		return (
			<div className={surfaceClass}>
				<div className="flex h-full flex-col justify-center gap-4 sm:flex-row sm:items-center">
					<div className="flex items-start gap-4">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
							<Shield className="h-6 w-6" aria-hidden="true" />
						</div>
						<div>
							<p className="text-base font-semibold text-slate-900">
								{t('governancePage.eligibilitySignInTitle')}
							</p>
							<p className="mt-1 text-sm leading-relaxed text-muted-foreground">
								{t('governancePage.eligibilitySignInDescription')}
							</p>
						</div>
					</div>
					<Button asChild variant="outline" className="rounded-full bg-white">
						<Link href="/sign-in">{t('nav.signIn')}</Link>
					</Button>
				</div>
			</div>
		)
	}

	if (!data?.eligible) {
		return (
			<div
				className={cn(
					surfaceClass,
					'border-amber-200/70 bg-gradient-to-br from-amber-50/70 via-white to-white',
				)}
			>
				<div className="flex h-full flex-col justify-center gap-4 sm:flex-row sm:items-center">
					<div className="flex items-start gap-4">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
							<AlertCircle className="h-6 w-6" aria-hidden="true" />
						</div>
						<div>
							<p className="text-base font-semibold text-slate-900">
								{t('governancePage.eligibilityLockedTitle')}
							</p>
							<p className="mt-1 text-sm leading-relaxed text-muted-foreground">
								{t('governancePage.eligibilityLockedDescription')}
							</p>
						</div>
					</div>
					<Button asChild className="gradient-btn rounded-full text-white">
						<Link href="/projects">{t('governancePage.eligibilityLockedCta')}</Link>
					</Button>
				</div>
			</div>
		)
	}

	const tier = data.tier as NftTier
	const tierLabel = TIER_LABELS[tier]
	const voteWeight = TIER_VOTE_WEIGHTS[tier]
	const tierColor = TIER_COLORS[tier]

	return (
		<div
			className={cn(
				surfaceClass,
				'border-emerald-200/70 bg-gradient-to-br from-emerald-50/70 via-white to-white',
			)}
		>
			<div className="flex h-full flex-col justify-between gap-5 sm:flex-row sm:items-center">
				<div className="flex items-start gap-4">
					<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
						<CheckCircle2 className="h-6 w-6" aria-hidden="true" />
					</div>
					<div>
						<p className="text-base font-semibold text-slate-900">
							{t('governancePage.eligibilityReadyTitle')}
						</p>
						<p className="mt-1 text-sm leading-relaxed text-muted-foreground">
							{t('governancePage.eligibilityReadyDescription')}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-4">
					<Badge className={cn('border px-3 py-1', tierColor)}>{tierLabel}</Badge>
					<div className="rounded-2xl border border-emerald-100 bg-white/80 px-4 py-3 text-center">
						<div className="flex items-center justify-center gap-1.5 text-emerald-700">
							<Vote className="h-4 w-4" aria-hidden="true" />
							<p className="text-2xl font-bold tabular-nums leading-none">{voteWeight}</p>
						</div>
						<p className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
							{t('governancePage.eligibilityWeight')}
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
