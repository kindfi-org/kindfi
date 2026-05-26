'use client'

import { ArrowRight, Vote } from 'lucide-react'
import Link from 'next/link'
import { Button } from '~/components/base/button'
import { useI18n } from '~/lib/i18n'
import { ProfileSurfaceCard } from '../profile-surface-card'

export function GovernanceCard() {
	const { t } = useI18n()

	return (
		<ProfileSurfaceCard className="overflow-hidden">
			<div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex gap-4">
					<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
						<Vote className="h-5 w-5" aria-hidden="true" />
					</div>
					<div className="space-y-1">
						<h3 className="text-base font-semibold text-gray-900">
							{t('profile.governanceTitle')}
						</h3>
						<p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
							{t('profile.governanceDescription')}
						</p>
					</div>
				</div>
				<Button
					asChild
					className="gradient-btn shrink-0 rounded-full text-white sm:min-w-[180px]"
				>
					<Link href="/governance">
						{t('profile.governanceCta')}
						<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
					</Link>
				</Button>
			</div>
		</ProfileSurfaceCard>
	)
}
