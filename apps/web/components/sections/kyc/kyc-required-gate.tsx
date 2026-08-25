'use client'

import { Clock, LifeBuoy, RefreshCw, Shield, ShieldAlert, XCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/base/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '~/components/base/dialog'
import { KYCRedirectModal } from '~/components/sections/profile/modals/kyc-redirect-modal'
import { useDiditKYC } from '~/hooks/use-didit-kyc'
import { useI18n } from '~/lib/i18n'
import type { KycDenialPayload } from '~/lib/kyc/client'
import type { CanonicalKycStatus, KycRequiredAction } from '~/lib/kyc/types'

interface KycRequiredGateProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	userId: string
	denial: KycDenialPayload | null
}

const messageKeyForStatus = (status: CanonicalKycStatus): string => {
	switch (status) {
		case 'not_started':
			return 'profile.kycGateNotStarted'
		case 'pending':
			return 'profile.kycGatePending'
		case 'in_review':
		case 'manual_review':
			return 'profile.kycGateInReview'
		case 'rejected':
			return 'profile.kycGateRejected'
		case 'expired':
			return 'profile.kycGateExpired'
		case 'provider_unavailable':
			return 'profile.kycGateUnavailable'
		default:
			return 'profile.kycGateNotStarted'
	}
}

const primaryActionLabel = (requiredAction?: KycRequiredAction): string => {
	if (requiredAction === 'contact_support') return 'profile.kycGateContactSupport'
	if (requiredAction === 'wait_for_review') return 'profile.kycGateRecheck'
	return 'profile.kycGateStart'
}

export const KycRequiredGate = ({ open, onOpenChange, userId, denial }: KycRequiredGateProps) => {
	const { t } = useI18n()
	const { createSession, checkStatusFromDidit, kycStatus } = useDiditKYC(userId, {
		enabled: open && Boolean(userId),
	})
	const [isWorking, setIsWorking] = useState(false)
	const [verificationUrl, setVerificationUrl] = useState<string | null>(null)
	const [showRedirectModal, setShowRedirectModal] = useState(false)

	const status = denial?.currentKycStatus ?? 'not_started'
	const requiredAction = denial?.requiredAction

	const handlePrimary = async () => {
		if (requiredAction === 'contact_support') {
			window.location.href = '/support'
			return
		}

		setIsWorking(true)
		try {
			if (requiredAction === 'wait_for_review') {
				const result = await checkStatusFromDidit()
				if (result && 'canonicalStatus' in result && result.canonicalStatus === 'approved') {
					toast.success(t('profile.kycUpdatedApproved'))
					onOpenChange(false)
					return
				}
				toast.message(t('profile.kycGateStillPending'))
				return
			}

			const callbackUrl = `${window.location.origin}/profile?kyc=completed`
			const result = await createSession(callbackUrl)
			if (result.success && result.verificationUrl) {
				setVerificationUrl(result.verificationUrl)
				setShowRedirectModal(true)
			} else {
				toast.error(result.error || t('profile.kycStartFailed'))
			}
		} finally {
			setIsWorking(false)
		}
	}

	const handleRecheck = async () => {
		setIsWorking(true)
		try {
			await checkStatusFromDidit()
			toast.message(t('profile.kycGateRecheckDone'))
		} finally {
			setIsWorking(false)
		}
	}

	const Icon =
		status === 'rejected' || status === 'expired'
			? XCircle
			: status === 'in_review' || status === 'pending' || status === 'manual_review'
				? Clock
				: ShieldAlert

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<div className="mb-1 flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
								<Icon className="h-5 w-5" />
							</div>
							<DialogTitle>{t('profile.kycGateTitle')}</DialogTitle>
						</div>
						<DialogDescription className="space-y-3 pt-2 text-left">
							<p>{t('profile.kycGateWhy')}</p>
							<p>{t(messageKeyForStatus(status))}</p>
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="flex-col gap-2 sm:flex-col">
						<Button
							onClick={handlePrimary}
							disabled={isWorking || kycStatus.isLoading}
							className="w-full"
						>
							<Shield className="mr-2 h-4 w-4" />
							{isWorking ? t('profile.kycStarting') : t(primaryActionLabel(requiredAction))}
						</Button>
						<Button
							variant="outline"
							onClick={handleRecheck}
							disabled={isWorking}
							className="w-full"
						>
							<RefreshCw className="mr-2 h-4 w-4" />
							{t('profile.kycGateRecheck')}
						</Button>
						<Button variant="ghost" asChild className="w-full">
							<a href="/support">
								<LifeBuoy className="mr-2 h-4 w-4" />
								{t('profile.kycGateContactSupport')}
							</a>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

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
