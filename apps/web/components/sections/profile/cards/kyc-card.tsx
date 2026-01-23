'use client'

import { motion } from 'framer-motion'
import {
	CheckCircle2,
	Clock,
	Lock,
	Shield,
	Sparkles,
	XCircle,
} from 'lucide-react'
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
	const { kycStatus, createSession, refreshStatus } = useDiditKYC(userId || '')
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
					<Badge className="bg-[#000124] text-white">
						<CheckCircle2 className="h-3 w-3 mr-1.5" />
						Verified
					</Badge>
				)
			case 'pending':
				return (
					<Badge
						variant="outline"
						className="bg-yellow-50 text-yellow-600 border-yellow-300"
					>
						In Progress
					</Badge>
				)
			case 'rejected':
				return (
					<Badge
						variant="outline"
						className="bg-red-50 text-red-600 border-red-300"
					>
						Rejected
					</Badge>
				)
			default:
				// Always show a badge, even when status is null
				return (
					<Badge
						variant="outline"
						className="bg-gray-50 text-gray-600 border-gray-300"
					>
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

	const getStatusIcon = () => {
		switch (kycStatus.status) {
			case 'approved':
			case 'verified':
				return <CheckCircle2 className="h-16 w-16 text-[#000124]" />
			case 'pending':
				return <Clock className="h-16 w-16 text-yellow-500" />
			case 'rejected':
				return <XCircle className="h-16 w-16 text-red-500" />
			default:
				return <Lock className="h-16 w-16 text-gray-400" />
		}
	}

	const getStatusColor = () => {
		switch (kycStatus.status) {
			case 'approved':
			case 'verified':
				return 'bg-[#000124]/5'
			case 'pending':
				return 'bg-yellow-50'
			case 'rejected':
				return 'bg-red-50'
			default:
				return 'bg-gray-50'
		}
	}

	const getBenefits = () => {
		if (kycStatus.status === 'approved' || kycStatus.status === 'verified') {
			return [
				{
					icon: CheckCircle2,
					text: 'Full platform access',
					color: 'text-[#000124]',
				},
				{ icon: Shield, text: 'Enhanced security', color: 'text-[#000124]' },
				{
					icon: Sparkles,
					text: 'Trust badge visible',
					color: 'text-[#000124]',
				},
			]
		}
		return [
			{ icon: Lock, text: 'Unlock all features', color: 'text-gray-600' },
			{ icon: Shield, text: 'Build community trust', color: 'text-gray-600' },
			{ icon: Sparkles, text: 'Get verified badge', color: 'text-gray-600' },
		]
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
				whileHover={{ y: -4 }}
				transition={{ type: 'spring', stiffness: 400, damping: 25 }}
				className="h-full"
			>
				<Card className="h-full overflow-hidden bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col">
					{/* Top gradient bar */}
					<div className="h-2 bg-gradient-to-r from-[#000124] to-[#000124]/70" />

					<CardHeader className="pb-4 pt-6 flex-shrink-0">
						<div className="flex items-center justify-between gap-3 mb-4">
							<CardTitle className="text-lg font-bold flex items-center gap-2.5 text-gray-800">
								<div className="p-2 rounded-lg bg-[#000124]/10 text-[#000124]">
									<Shield className="h-4 w-4" />
								</div>
								<span>KYC Verification</span>
							</CardTitle>
							<div className="flex-shrink-0">{getStatusBadge()}</div>
						</div>
					</CardHeader>
					<CardContent className="flex flex-col flex-1 min-h-0 px-6 pb-6">
						{/* Status Icon Section */}
						<div
							className={`flex justify-center items-center mb-6 p-6 rounded-xl ${getStatusColor()} transition-colors`}
						>
							<motion.div
								initial={{ scale: 0.8, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								transition={{ duration: 0.3 }}
							>
								{getStatusIcon()}
							</motion.div>
						</div>

						{/* Status Message */}
						<p className="text-sm text-gray-700 leading-relaxed font-medium text-center mb-6">
							{getStatusMessage()}
						</p>

						{/* Benefits List */}
						<div className="space-y-3 mb-6 flex-1">
							{(() => {
								const benefits = getBenefits()
								return benefits.map((benefit, index) => {
									const IconComponent = benefit.icon
									return (
										<motion.div
											key={benefit.text}
											initial={{ opacity: 0, x: -10 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: index * 0.1 }}
											className="flex items-center gap-3"
										>
											<div
												className={`p-1.5 rounded-md ${benefit.color.includes('gray') ? 'bg-gray-100' : 'bg-[#000124]/10'}`}
											>
												<IconComponent className={`h-4 w-4 ${benefit.color}`} />
											</div>
											<span className={`text-xs font-medium ${benefit.color}`}>
												{benefit.text}
											</span>
										</motion.div>
									)
								})
							})()}
						</div>

						{/* Action Button */}
						{shouldShowButton && (
							<motion.div
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								className="mt-auto"
							>
								<Button
									onClick={handleStartKYC}
									disabled={isCreating || kycStatus.isLoading}
									className="w-full bg-[#000124] hover:bg-[#000124]/90 text-white font-semibold transition-all shadow-md hover:shadow-lg"
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
