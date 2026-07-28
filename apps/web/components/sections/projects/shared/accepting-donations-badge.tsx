'use client'

import { Heart } from 'lucide-react'
import { useI18n } from '~/lib/i18n'
import { cn } from '~/lib/utils'

interface AcceptingDonationsBadgeProps {
	className?: string
}

/**
 * Compact, single-line badge for projects with an active escrow.
 * Matches CategoryBadge display sizing so card overlays stay consistent.
 */
export function AcceptingDonationsBadge({ className }: AcceptingDonationsBadgeProps) {
	const { t } = useI18n()
	const label = t('projects.acceptingDonations')

	return (
		<span
			className={cn(
				'inline-flex h-6 max-w-[10.5rem] shrink-0 items-center gap-1 rounded-full border-0 bg-emerald-600/95 px-2.5 text-[11px] font-semibold leading-none text-white shadow-sm backdrop-blur-md',
				className,
			)}
			title={label}
		>
			<span
				className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/20"
				aria-hidden="true"
			>
				<Heart className="h-2.5 w-2.5 fill-current" />
			</span>
			<span className="truncate">{label}</span>
		</span>
	)
}
