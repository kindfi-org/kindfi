'use client'

import { motion } from 'framer-motion'
import { Copy, Gift, Loader2, Share2, Sparkles, TrendingUp, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/base/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '~/components/base/dialog'
import { Input } from '~/components/base/input'
import { type Referral, useReferrals } from '~/hooks/referrals/use-referrals'
import { useEffectiveWalletAddress } from '~/hooks/wallet/use-effective-wallet-address'
import { staggerContainer } from '~/lib/constants/animations'
import { useI18n } from '~/lib/i18n'
import {
	clearPendingReferralCode,
	getPendingReferralCode,
} from '~/lib/referral/pending-referral-code'
import { profileFadeUp } from './profile-motion'

interface ReferralSectionProps {
	profilePollarAddress?: string | null
	profileExternalAddress?: string | null
}

export function ReferralSection({
	profilePollarAddress,
	profileExternalAddress,
}: ReferralSectionProps) {
	const { t } = useI18n()
	const [showShareDialog, setShowShareDialog] = useState(false)
	const [applyCode, setApplyCode] = useState('')
	const { address: walletAddress, isReady: isWalletReady } = useEffectiveWalletAddress({
		profilePollarAddress,
		profileExternalAddress,
	})

	const { data, isLoading, error, activateReferral, isActivating, applyReferralCode, isApplying } =
		useReferrals()

	useEffect(() => {
		const pendingCode = getPendingReferralCode()
		if (pendingCode && !data?.referred_by) {
			setApplyCode(pendingCode)
		}
	}, [data?.referred_by])

	const referralCode = data?.referral_code
	const isActivated = data?.is_activated ?? false
	const referrals = data?.referrals ?? []
	const stats = data?.statistics ?? {
		total_referrals: 0,
		active_referrals: 0,
		total_reward_points: 0,
	}
	const referredBy = data?.referred_by

	const handleCopyReferralCode = () => {
		if (!referralCode) return
		navigator.clipboard.writeText(referralCode)
		toast.success(t('profile.referralsCopied'))
	}

	const handleShare = () => {
		if (!referralCode) return
		const shareUrl = `${window.location.origin}/sign-up?ref=${referralCode}`
		navigator.clipboard.writeText(shareUrl)
		toast.success(t('profile.referralsLinkCopied'))
		setShowShareDialog(false)
	}

	const handleActivate = async () => {
		try {
			await activateReferral()
			toast.success(t('profile.referralsActivateSuccess'))
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t('profile.referralsActivateFailed'))
		}
	}

	const handleApplyCode = async () => {
		const trimmed = applyCode.trim()
		if (!trimmed) return

		try {
			await applyReferralCode(trimmed)
			clearPendingReferralCode()
			setApplyCode('')
			toast.success(t('profile.referralsApplySuccess'))
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t('profile.referralsApplyFailed'))
		}
	}

	if (isLoading) {
		return (
			<Card>
				<CardContent className="py-12 text-center text-muted-foreground">
					<Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" />
					{t('profile.referralsLoading')}
				</CardContent>
			</Card>
		)
	}

	if (error) {
		return (
			<Card className="border-red-200 bg-red-50">
				<CardContent className="py-12 text-center text-red-600">
					{t('profile.referralsLoadError')}
				</CardContent>
			</Card>
		)
	}

	return (
		<motion.div
			variants={staggerContainer}
			initial="initial"
			animate="animate"
			className="space-y-6"
		>
			<motion.div {...profileFadeUp(0)}>
				<div>
					<h2 className="flex items-center gap-2 text-2xl font-bold">
						<Share2 className="h-6 w-6 text-primary" />
						{t('profile.referralsTitle')}
					</h2>
					<p className="mt-1 text-muted-foreground">{t('profile.referralsDescription')}</p>
				</div>
			</motion.div>

			{!isActivated ? (
				<motion.div {...profileFadeUp(0.05)}>
					<Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-emerald-50">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Sparkles className="h-5 w-5 text-primary" />
								{t('profile.referralsActivateTitle')}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<p className="text-sm text-muted-foreground">
								{t('profile.referralsActivateDescription')}
							</p>
							{!isWalletReady || !walletAddress ? (
								<p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
									{t('profile.referralsWalletRequired')}
								</p>
							) : null}
							<Button
								onClick={handleActivate}
								disabled={isActivating || !isWalletReady || !walletAddress}
								className="gradient-btn rounded-full text-white"
							>
								{isActivating ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										{t('profile.referralsActivating')}
									</>
								) : (
									t('profile.referralsActivateCta')
								)}
							</Button>
						</CardContent>
					</Card>
				</motion.div>
			) : (
				<motion.div {...profileFadeUp(0.05)}>
					<Card className="border-primary/20 bg-gradient-to-r from-primary/10 to-purple-50">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Gift className="h-5 w-5 text-primary" />
								{t('profile.referralsYourCode')}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
								<code className="flex-1 rounded-lg border-2 border-primary/20 bg-white px-4 py-3 font-mono text-lg font-bold">
									{referralCode}
								</code>
								<div className="flex gap-2">
									<Button onClick={handleCopyReferralCode} variant="outline" size="sm">
										<Copy className="mr-2 h-4 w-4" />
										{t('profile.referralsCopy')}
									</Button>
									<Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
										<DialogTrigger asChild>
											<Button variant="default" size="sm">
												<Share2 className="mr-2 h-4 w-4" />
												{t('profile.referralsShare')}
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>{t('profile.referralsShareTitle')}</DialogTitle>
												<DialogDescription>
													{t('profile.referralsShareDescription')}
												</DialogDescription>
											</DialogHeader>
											<div className="flex items-center gap-2">
												<input
													type="text"
													readOnly
													value={`${window.location.origin}/sign-up?ref=${referralCode}`}
													className="flex-1 rounded-lg border px-3 py-2"
												/>
												<Button onClick={handleShare} size="sm">
													<Copy className="mr-2 h-4 w-4" />
													{t('profile.referralsCopyLink')}
												</Button>
											</div>
										</DialogContent>
									</Dialog>
								</div>
							</div>
							<div className="flex flex-wrap gap-2 text-sm">
								<Badge variant="outline" className="bg-white">
									{t('profile.referralsRewardOnboarding')}
								</Badge>
								<Badge variant="outline" className="bg-white">
									{t('profile.referralsRewardDonation')}
								</Badge>
							</div>
							{data?.referral_profile?.on_chain_ready ? (
								<p className="text-xs text-emerald-700">{t('profile.referralsOnChainReady')}</p>
							) : null}
						</CardContent>
					</Card>
				</motion.div>
			)}

			{!referredBy ? (
				<motion.div {...profileFadeUp(0.08)}>
					<Card>
						<CardHeader>
							<CardTitle className="text-base">{t('profile.referralsHaveCodeTitle')}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<p className="text-sm text-muted-foreground">
								{t('profile.referralsHaveCodeDescription')}
							</p>
							<div className="flex flex-col gap-2 sm:flex-row">
								<Input
									value={applyCode}
									onChange={(event) => setApplyCode(event.target.value.toUpperCase())}
									placeholder={t('profile.referralsCodePlaceholder')}
									className="font-mono uppercase"
									maxLength={12}
								/>
								<Button
									onClick={handleApplyCode}
									disabled={isApplying || !applyCode.trim()}
									className="shrink-0 rounded-full"
								>
									{isApplying ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											{t('profile.referralsApplying')}
										</>
									) : (
										t('profile.referralsApplyCta')
									)}
								</Button>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			) : (
				<motion.div {...profileFadeUp(0.08)}>
					<Card className="border-green-200 bg-green-50">
						<CardContent className="py-4">
							<div className="flex items-center gap-2 text-sm text-green-900">
								<Users className="h-4 w-4 text-green-600" />
								{t('profile.referralsReferredBy')}
							</div>
						</CardContent>
					</Card>
				</motion.div>
			)}

			{isActivated ? (
				<>
					<motion.div {...profileFadeUp(0.1)} className="grid gap-4 md:grid-cols-3">
						<StatCard
							title={t('profile.referralsStatTotal')}
							value={stats.total_referrals}
							icon={Users}
							color="text-blue-600"
						/>
						<StatCard
							title={t('profile.referralsStatActive')}
							value={stats.active_referrals}
							icon={TrendingUp}
							color="text-green-600"
						/>
						<StatCard
							title={t('profile.referralsStatPoints')}
							value={stats.total_reward_points}
							icon={Gift}
							color="text-purple-600"
						/>
					</motion.div>

					{referrals.length > 0 ? (
						<motion.div {...profileFadeUp(0.12)}>
							<Card>
								<CardHeader>
									<CardTitle>{t('profile.referralsListTitle')}</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										{referrals.map((referral, index) => (
											<ReferralItem key={referral.id} referral={referral} index={index} />
										))}
									</div>
								</CardContent>
							</Card>
						</motion.div>
					) : (
						<motion.div {...profileFadeUp(0.12)}>
							<Card>
								<CardContent className="py-12 text-center text-muted-foreground">
									<Share2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
									<p className="font-medium">{t('profile.referralsEmptyTitle')}</p>
									<p className="mt-2 text-sm">{t('profile.referralsEmptyDescription')}</p>
								</CardContent>
							</Card>
						</motion.div>
					)}
				</>
			) : null}
		</motion.div>
	)
}

function StatCard({
	title,
	value,
	icon: Icon,
	color,
}: {
	title: string
	value: number
	icon: typeof Users
	color: string
}) {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			whileHover={{ y: -2 }}
		>
			<Card>
				<CardContent className="p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-muted-foreground">{title}</p>
							<p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
						</div>
						<div className={`rounded-lg bg-muted p-3 ${color}`}>
							<Icon className="h-6 w-6" />
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	)
}

function ReferralItem({ referral, index }: { referral: Referral; index: number }) {
	const { t } = useI18n()

	const statusColors: Record<string, string> = {
		pending: 'bg-gray-100 text-gray-600',
		onboarded: 'bg-blue-100 text-blue-600',
		first_donation: 'bg-green-100 text-green-600',
		active: 'bg-purple-100 text-purple-600',
	}

	const statusLabels: Record<string, string> = {
		pending: t('profile.referralsStatusPending'),
		onboarded: t('profile.referralsStatusOnboarded'),
		first_donation: t('profile.referralsStatusFirstDonation'),
		active: t('profile.referralsStatusActive'),
	}

	return (
		<motion.div
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ delay: index * 0.1 }}
			className="flex items-center justify-between rounded-lg bg-muted/50 p-4 transition-colors hover:bg-muted"
		>
			<div className="flex flex-1 items-center gap-3">
				<div className="rounded-full bg-primary/10 p-2">
					<Users className="h-4 w-4 text-primary" />
				</div>
				<div className="flex-1">
					<p className="text-sm font-medium">
						{t('profile.referralsListItem')}
						{referral.id.slice(0, 8)}
					</p>
					<p className="text-xs text-muted-foreground">
						{t('profile.referralsJoined')}
						{new Date(referral.created_at).toLocaleDateString()}
					</p>
				</div>
			</div>
			<div className="flex items-center gap-3">
				<Badge className={statusColors[referral.status]}>{statusLabels[referral.status]}</Badge>
				{referral.total_donations > 0 ? (
					<span className="text-sm font-medium">
						{referral.total_donations === 1
							? t('profile.referralsDonationOne')
							: t('profile.referralsDonationMany').replace(
									'{count}',
									String(referral.total_donations),
								)}
					</span>
				) : null}
			</div>
		</motion.div>
	)
}
