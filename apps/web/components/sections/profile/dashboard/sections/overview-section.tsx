'use client'

import { motion } from 'framer-motion'
import {
	AlertCircle,
	BarChart3,
	CheckCircle2,
	DollarSign,
	Gift,
	Heart,
	LayoutDashboard,
	Shield,
	Sparkles,
	UserCircle,
	Wallet,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Suspense } from 'react'
import { Button } from '~/components/base/button'
import { useDashboardContext } from '~/hooks/profile/use-dashboard-context'
import { useDiditKYC } from '~/hooks/use-didit-kyc'
import { useI18n } from '~/lib/i18n'
import { isCreatorProfileRole } from '~/lib/profile/is-creator-profile-role'
import { profileFadeUp } from '../../profile-motion'
import { ActionCard } from '../action-card'
import { SectionHeader } from '../section-header'
import { StatSummary } from '../stat-summary'

const CreatorProfile = dynamic(
	() =>
		import('../../views/creator-profile').then((mod) => ({
			default: mod.CreatorProfile,
		})),
	{ ssr: false },
)

const DonorProfile = dynamic(
	() =>
		import('../../views/donor-profile').then((mod) => ({
			default: mod.DonorProfile,
		})),
	{ ssr: false },
)

export function OverviewSection() {
	const { t } = useI18n()
	const { user, role, isWalletReady, effectiveWalletAddress } = useDashboardContext()
	const isCreator = isCreatorProfileRole(role)
	const { kycStatus } = useDiditKYC(user.id)

	const kycApproved = kycStatus.status === 'approved' || kycStatus.status === 'verified'
	const kycPending = kycStatus.status === 'pending' || kycStatus.status === 'in_review'

	/** Attention items — only show relevant ones */
	const attentionItems: {
		key: string
		label: string
		description: string
		href: string
		icon: typeof AlertCircle
	}[] = []

	if (!role) {
		attentionItems.push({
			key: 'role',
			label: t('profile.overviewAttentionRole'),
			description: t('profile.overviewAttentionRoleWhy'),
			href: '/profile?section=settings',
			icon: UserCircle,
		})
	}
	if (!kycApproved && !kycPending) {
		attentionItems.push({
			key: 'kyc',
			label: t('profile.overviewAttentionKyc'),
			description: t('profile.overviewAttentionKycWhy'),
			href: '/profile?section=kyc',
			icon: Shield,
		})
	}
	if (!isWalletReady || !effectiveWalletAddress) {
		attentionItems.push({
			key: 'wallet',
			label: t('profile.overviewAttentionWallet'),
			description: t('profile.overviewAttentionWalletWhy'),
			href: '/profile?section=wallets',
			icon: Wallet,
		})
	}

	return (
		<div className="space-y-6">
			<motion.div {...profileFadeUp(0)}>
				<SectionHeader
					icon={LayoutDashboard}
					title={t('profile.overviewTitle')}
					description={t('profile.overviewDescription')}
				/>
			</motion.div>

			{/* Needs attention */}
			{attentionItems.length > 0 ? (
				<motion.div {...profileFadeUp(0.05)}>
					<ActionCard
						icon={AlertCircle}
						iconClassName="bg-amber-50 text-amber-700"
						title={t('profile.overviewAttentionTitle')}
						description={t('profile.overviewAttentionDescription')}
					>
						<ul className="space-y-2" aria-label={t('profile.overviewAttentionTitle')}>
							{attentionItems.map((item) => (
								<li key={item.key}>
									<Link
										href={item.href}
										className="flex items-start gap-3 rounded-lg border border-amber-100 bg-amber-50/50 px-3 py-2.5 text-sm transition-colors hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
									>
										<item.icon
											className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
											aria-hidden="true"
										/>
										<span>
											<span className="block font-medium text-amber-900">{item.label}</span>
											<span className="mt-0.5 block text-xs text-amber-800/70">
												{item.description}
											</span>
										</span>
									</Link>
								</li>
							))}
						</ul>
					</ActionCard>
				</motion.div>
			) : (
				<motion.div {...profileFadeUp(0.05)}>
					<ActionCard
						icon={CheckCircle2}
						iconClassName="bg-emerald-50 text-emerald-700"
						title={t('profile.overviewAllGoodTitle')}
						description={t('profile.overviewAllGoodDescription')}
					/>
				</motion.div>
			)}

			{/* Role-specific stats */}
			{role ? (
				<motion.div {...profileFadeUp(0.07)}>
					{isCreator ? (
						<ActionCard
							icon={BarChart3}
							iconClassName="bg-indigo-50 text-indigo-700"
							title={t('profile.overviewStatsTitle')}
						>
							<Suspense fallback={null}>
								<CreatorProfile userId={user.id} displayName="" showSection="overview" />
							</Suspense>
						</ActionCard>
					) : (
						<ActionCard
							icon={Heart}
							iconClassName="bg-pink-50 text-pink-700"
							title={t('profile.overviewStatsTitle')}
						>
							<Suspense fallback={null}>
								<DonorProfile userId={user.id} displayName="" showSection="overview" />
							</Suspense>
						</ActionCard>
					)}
				</motion.div>
			) : null}

			{/* Quick actions */}
			<motion.div {...profileFadeUp(0.09)}>
				<ActionCard
					icon={isCreator ? Gift : Sparkles}
					iconClassName="bg-emerald-50 text-emerald-700"
					title={
						isCreator
							? t('profile.overviewQuickActionsCreatorTitle')
							: t('profile.overviewQuickActionsDonorTitle')
					}
					description={
						isCreator
							? t('profile.overviewQuickActionsCreatorDescription')
							: t('profile.overviewQuickActionsDonorDescription')
					}
				>
					<div className="flex flex-wrap gap-2">
						{isCreator ? (
							<>
								<Button asChild size="sm" className="gradient-btn rounded-full text-white">
									<Link href="/create-project">{t('profile.createCampaign')}</Link>
								</Button>
								<Button asChild variant="outline" size="sm" className="rounded-full">
									<Link href="/profile?section=campaigns">
										{t('profile.overviewViewCampaigns')}
									</Link>
								</Button>
							</>
						) : (
							<>
								<Button asChild size="sm" className="gradient-btn rounded-full text-white">
									<Link href="/projects">{t('profile.exploreCauses')}</Link>
								</Button>
								<Button asChild variant="outline" size="sm" className="rounded-full">
									<Link href="/profile?section=donations">
										{t('profile.overviewViewDonations')}
									</Link>
								</Button>
							</>
						)}
					</div>
				</ActionCard>
			</motion.div>
		</div>
	)
}
