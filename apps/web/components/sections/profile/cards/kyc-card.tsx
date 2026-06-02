'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Clock, Shield, Sparkles, XCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { useDiditKYC } from '~/hooks/use-didit-kyc'
import { useI18n } from '~/lib/i18n'
import { cn } from '~/lib/utils'
import { KYCRedirectModal } from '../modals/kyc-redirect-modal'
import { profileFadeUp } from '../profile-motion'
import { ProfileSurfaceCard } from '../profile-surface-card'

interface KYCCardProps {
	userId: string
	shouldRefresh?: boolean
}

export function KYCCard({ userId, shouldRefresh = false }: KYCCardProps) {
	const { t } = useI18n()
	const { kycStatus, createSession, refreshStatus } = useDiditKYC(userId || '')
	const [isCreating, setIsCreating] = useState(false)
	const [showRedirectModal, setShowRedirectModal] = useState(false)
	const [verificationUrl, setVerificationUrl] = useState<string | null>(null)

	useEffect(() => {
		refreshStatus()
	}, [refreshStatus])

	const refreshRef = useRef(refreshStatus)
	refreshRef.current = refreshStatus

	useEffect(() => {
		const handleStatusUpdate = () => {
			refreshRef.current()
		}
		window.addEventListener('kyc-status-updated', handleStatusUpdate)
		return () => window.removeEventListener('kyc-status-updated', handleStatusUpdate)
	}, [])

	useEffect(() => {
		if (shouldRefresh) refreshStatus()
	}, [shouldRefresh, refreshStatus])

	const handleStartKYC = async () => {
		setIsCreating(true)
		try {
			const callbackUrl = `${window.location.origin}/profile?kyc=completed`
			const result = await createSession(callbackUrl)

			if (result.success && result.verificationUrl) {
				setVerificationUrl(result.verificationUrl)
				setShowRedirectModal(true)
			} else {
				toast.error(result.error || t('profile.kycStartFailed'))
			}
		} catch (error) {
			logger.error('Failed to start KYC:', error)
			toast.error(t('profile.kycStartFailed'))
		} finally {
			setIsCreating(false)
		}
	}

	const statusConfig = getStatusConfig(kycStatus.status, kycStatus.isLoading, kycStatus.error, t)

	const shouldShowButton =
		!kycStatus.status || kycStatus.status === 'rejected' || kycStatus.error !== null

	if (!userId) {
		return (
			<ProfileSurfaceCard className="border-red-200 bg-red-50/50">
				<p className="text-sm text-red-700">{t('profile.kycUserMissing')}</p>
			</ProfileSurfaceCard>
		)
	}

	return (
		<>
			<motion.div {...profileFadeUp(0.05)} className="h-full">
				<ProfileSurfaceCard className="flex h-full flex-col">
					<div className="flex items-start justify-between gap-3">
						<div className="flex items-center gap-3">
							<div
								className={cn(
									'flex h-11 w-11 items-center justify-center rounded-xl',
									statusConfig.iconWrapClass,
								)}
							>
								<statusConfig.Icon className="h-5 w-5" />
							</div>
							<div>
								<h3 className="text-base font-semibold text-gray-900">{t('profile.kycTitle')}</h3>
								<p className="text-sm text-muted-foreground">{statusConfig.message}</p>
							</div>
						</div>
						<Badge className={cn('rounded-full', statusConfig.badgeClass)}>
							{statusConfig.badgeLabel}
						</Badge>
					</div>

					<ul className="mt-5 space-y-2.5">
						{statusConfig.benefits.map((benefit) => (
							<li
								key={benefit}
								className="flex items-center gap-2 text-xs font-medium text-slate-600"
							>
								<Sparkles className="h-3.5 w-3.5 text-emerald-600" />
								{benefit}
							</li>
						))}
					</ul>

					{shouldShowButton ? (
						<Button
							onClick={handleStartKYC}
							disabled={isCreating || kycStatus.isLoading}
							className="gradient-btn mt-auto w-full rounded-full text-white"
							size="sm"
						>
							<Shield className="mr-2 h-4 w-4" />
							{isCreating
								? t('profile.kycStarting')
								: kycStatus.status === 'rejected'
									? t('profile.kycRetry')
									: t('profile.kycStart')}
						</Button>
					) : null}
				</ProfileSurfaceCard>
			</motion.div>

			{verificationUrl ? (
				<KYCRedirectModal
					open={showRedirectModal}
					onOpenChange={setShowRedirectModal}
					verificationUrl={verificationUrl}
					onCancel={() => {
						setShowRedirectModal(false)
						setVerificationUrl(null)
					}}
				/>
			) : null}
		</>
	)
}

function getStatusConfig(
	status: string | null,
	isLoading: boolean,
	error: string | null,
	t: (key: string) => string,
) {
	if (isLoading) {
		return {
			Icon: Clock,
			iconWrapClass: 'bg-slate-100 text-slate-500',
			badgeClass: 'bg-slate-100 text-slate-700 hover:bg-slate-100',
			badgeLabel: t('profile.kycLoading'),
			message: t('profile.kycLoadingMessage'),
			benefits: [t('profile.kycBenefit1'), t('profile.kycBenefit2')],
		}
	}

	if (error) {
		return {
			Icon: XCircle,
			iconWrapClass: 'bg-orange-50 text-orange-600',
			badgeClass: 'bg-orange-50 text-orange-700 hover:bg-orange-50',
			badgeLabel: t('profile.kycError'),
			message: t('profile.kycErrorMessage'),
			benefits: [t('profile.kycBenefit1'), t('profile.kycBenefit2')],
		}
	}

	switch (status) {
		case 'approved':
		case 'verified':
			return {
				Icon: CheckCircle2,
				iconWrapClass: 'bg-emerald-50 text-emerald-700',
				badgeClass: 'bg-emerald-50 text-emerald-800 hover:bg-emerald-50',
				badgeLabel: t('profile.kycVerified'),
				message: t('profile.kycVerifiedMessage'),
				benefits: [
					t('profile.kycVerifiedBenefit1'),
					t('profile.kycVerifiedBenefit2'),
					t('profile.kycVerifiedBenefit3'),
				],
			}
		case 'pending':
			return {
				Icon: Clock,
				iconWrapClass: 'bg-amber-50 text-amber-700',
				badgeClass: 'bg-amber-50 text-amber-800 hover:bg-amber-50',
				badgeLabel: t('profile.kycPending'),
				message: t('profile.kycPendingMessage'),
				benefits: [t('profile.kycBenefit1'), t('profile.kycBenefit2')],
			}
		case 'rejected':
			return {
				Icon: XCircle,
				iconWrapClass: 'bg-red-50 text-red-600',
				badgeClass: 'bg-red-50 text-red-700 hover:bg-red-50',
				badgeLabel: t('profile.kycRejected'),
				message: t('profile.kycRejectedMessage'),
				benefits: [t('profile.kycBenefit1'), t('profile.kycBenefit2')],
			}
		default:
			return {
				Icon: Shield,
				iconWrapClass: 'bg-slate-100 text-slate-600',
				badgeClass: 'bg-slate-100 text-slate-700 hover:bg-slate-100',
				badgeLabel: t('profile.kycNotStarted'),
				message: t('profile.kycNotStartedMessage'),
				benefits: [t('profile.kycBenefit1'), t('profile.kycBenefit2'), t('profile.kycBenefit3')],
			}
	}
}
