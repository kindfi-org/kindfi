'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Shield } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { useDiditKYC } from '~/hooks/use-didit-kyc'
import { KYCRedirectModal } from '../modals/kyc-redirect-modal'

interface KYCCardProps {
	userId: string
	shouldRefresh?: boolean
}

export function KYCCard({ userId, shouldRefresh = false }: KYCCardProps) {
	// Always call hooks unconditionally (React rules)
	const { kycStatus, createSession, refreshStatus, checkStatusFromDidit } =
		useDiditKYC(userId || '')
	const [isCreating, setIsCreating] = useState(false)
	const [showRedirectModal, setShowRedirectModal] = useState(false)
	const [verificationUrl, setVerificationUrl] = useState<string | null>(null)

	// Load status on mount
	useEffect(() => {
		refreshStatus()
	}, [refreshStatus])

	// Listen for KYC status update events and refresh when callback completes
	useEffect(() => {
		const handleStatusUpdate = () => {
			// Refresh status immediately when callback completes
			refreshStatus()
		}

		window.addEventListener('kyc-status-updated', handleStatusUpdate)

		return () => {
			window.removeEventListener('kyc-status-updated', handleStatusUpdate)
		}
	}, [refreshStatus])

	// Refresh when shouldRefresh prop changes (triggered by parent after callback)
	useEffect(() => {
		if (shouldRefresh) {
			refreshStatus()
		}
	}, [shouldRefresh, refreshStatus])

	const handleStartKYC = async () => {
		setIsCreating(true)
		try {
			// Set callback URL to redirect back to profile page after verification
			const callbackUrl = `${window.location.origin}/profile?kyc=completed`
			const result = await createSession(callbackUrl)

			if (result.success && result.verificationUrl) {
				// Show modal first, then redirect
				setVerificationUrl(result.verificationUrl)
				setShowRedirectModal(true)
			} else {
				toast.error(result.error || 'Failed to start verification')
			}
		} catch (error) {
			console.error('Failed to start KYC:', error)
			toast.error('Failed to start verification process')
		} finally {
			setIsCreating(false)
		}
	}

	const handleCancelRedirect = () => {
		setShowRedirectModal(false)
		setVerificationUrl(null)
	}

	const getStatusBadge = () => {
		if (kycStatus.isLoading) {
			return (
				<Badge variant="outline" className="bg-muted">
					Loading...
				</Badge>
			)
		}

		if (kycStatus.error) {
			return (
				<Badge
					variant="outline"
					className="bg-orange-500/10 text-orange-600 border-orange-500"
				>
					Error
				</Badge>
			)
		}

		switch (kycStatus.status) {
			case 'approved':
			case 'verified':
				return (
					<Badge className="bg-green-500 text-white">
						<CheckCircle2 className="h-3 w-3 mr-1" />
						Verified
					</Badge>
				)
			case 'pending':
				return (
					<Badge
						variant="outline"
						className="bg-yellow-500/10 text-yellow-600 border-yellow-500"
					>
						In Progress
					</Badge>
				)
			case 'rejected':
				return (
					<Badge
						variant="outline"
						className="bg-red-500/10 text-red-600 border-red-500"
					>
						Rejected
					</Badge>
				)
			default:
				// Always show a badge, even when status is null
				return (
					<Badge variant="outline" className="bg-muted text-muted-foreground">
						Not Started
					</Badge>
				)
		}
	}

	const getStatusMessage = () => {
		if (kycStatus.error) {
			return `Error loading status: ${kycStatus.error}. Please refresh the page.`
		}

		switch (kycStatus.status) {
			case 'approved':
			case 'verified':
				return 'Your identity has been verified successfully'
			case 'pending':
				return 'Your verification is in progress. Please wait for review.'
			case 'rejected':
				return 'Verification was rejected. Please review the requirements and try again.'
			default:
				return 'Complete verification to unlock all features and build trust with the community.'
		}
	}

	// Show button if no status, rejected, or error occurred
	const shouldShowButton =
		!kycStatus.status ||
		kycStatus.status === 'rejected' ||
		kycStatus.error !== null

	// Ensure userId is valid
	if (!userId) {
		return (
			<Card className="overflow-hidden bg-card shadow-lg border-2 border-red-500">
				<CardHeader>
					<CardTitle className="text-red-500 flex items-center gap-2">
						<Shield className="h-5 w-5" />
						KYC Verification - Error
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						User ID is missing. Please refresh the page or contact support.
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<>
			<motion.div
				whileHover={{ y: -5, scale: 1.02 }}
				transition={{ type: 'spring', stiffness: 300 }}
				className="h-full"
			>
				<Card className="overflow-hidden bg-card shadow-lg hover:shadow-2xl transition-all duration-300 relative group border-2 border-primary/20 h-full min-h-[180px]">
					{/* Decorative elements */}
					<div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700" />
					<div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full -ml-12 -mb-12 rotate-45" />

					<CardHeader className="pb-3 relative z-10">
						<div className="flex items-center justify-between">
							<CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
								<motion.div
									animate={{ rotate: [0, -10, 10, -10, 0] }}
									transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
								>
									<Shield className="h-5 w-5 text-primary" />
								</motion.div>
								KYC Verification
							</CardTitle>
							{getStatusBadge()}
						</div>
					</CardHeader>
					<CardContent className="relative z-10">
						<p className="text-sm text-muted-foreground mb-4 min-h-[40px]">
							{getStatusMessage()}
						</p>
						{shouldShowButton && (
							<motion.div
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								<Button
									onClick={handleStartKYC}
									disabled={isCreating || kycStatus.isLoading}
									className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg"
									size="sm"
								>
									<Shield className="h-4 w-4 mr-2" />
									{isCreating
										? 'Starting...'
										: kycStatus.status === 'rejected'
											? 'Retry Verification'
											: 'Start KYC Process'}
								</Button>
							</motion.div>
						)}
					</CardContent>
				</Card>
			</motion.div>

			{/* Redirect Confirmation Modal */}
			{verificationUrl && (
				<KYCRedirectModal
					open={showRedirectModal}
					onOpenChange={setShowRedirectModal}
					verificationUrl={verificationUrl}
					onCancel={handleCancelRedirect}
				/>
			)}
		</>
	)
}
