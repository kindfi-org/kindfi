'use client'

import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '~/components/base/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '~/components/base/dialog'

interface KYCRedirectModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	verificationUrl: string
	onCancel: () => void
	countdownSeconds?: number
}

export function KYCRedirectModal({
	open,
	onOpenChange,
	verificationUrl,
	onCancel,
	countdownSeconds = 3,
}: KYCRedirectModalProps) {
	const [redirectCountdown, setRedirectCountdown] = useState(countdownSeconds)

	// Reset countdown when modal opens
	useEffect(() => {
		if (open) {
			setRedirectCountdown(countdownSeconds)
		}
	}, [open, countdownSeconds])

	// Handle countdown and redirect
	useEffect(() => {
		if (!open || !verificationUrl) {
			return
		}

		if (redirectCountdown === 0) {
			// Redirect after countdown reaches 0
			window.location.href = verificationUrl
			return
		}

		// Countdown timer
		const timer = setTimeout(() => {
			setRedirectCountdown((prev) => prev - 1)
		}, 1000)

		return () => clearTimeout(timer)
	}, [open, verificationUrl, redirectCountdown])

	const handleCancelRedirect = () => {
		onOpenChange(false)
		onCancel()
	}

	const handleRedirectNow = () => {
		window.location.href = verificationUrl
	}

	return (
		<Dialog open={open} onOpenChange={handleCancelRedirect}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<div className="flex items-center gap-3 mb-2">
						<motion.div
							animate={{ rotate: [0, 360] }}
							transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
						>
							<Shield className="h-6 w-6 text-primary" />
						</motion.div>
						<DialogTitle className="text-xl font-bold">
							Redirecting to Verification
						</DialogTitle>
					</div>
					<DialogDescription className="text-base space-y-3 pt-2">
						<p>
							You're about to be redirected to our secure verification partner,{' '}
							<strong>Didit</strong>, to complete your identity verification.
						</p>
						<p className="text-sm text-muted-foreground">
							This process typically takes 2-5 minutes. You'll be redirected
							back to your profile once verification is complete.
						</p>
						{redirectCountdown > 0 && (
							<div className="flex items-center gap-2 pt-2">
								<div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
									<motion.div
										className="h-full bg-primary"
										initial={{ width: '0%' }}
										animate={{
											width: `${((countdownSeconds - redirectCountdown) / countdownSeconds) * 100}%`,
										}}
										transition={{ duration: 1, ease: 'linear' }}
									/>
								</div>
								<span className="text-sm font-medium text-muted-foreground min-w-[3rem] text-right">
									{redirectCountdown}s
								</span>
							</div>
						)}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="flex-col sm:flex-row gap-2">
					<Button
						variant="outline"
						onClick={handleCancelRedirect}
						disabled={redirectCountdown === 0}
						className="w-full sm:w-auto"
					>
						Cancel
					</Button>
					<Button
						onClick={handleRedirectNow}
						className="w-full sm:w-auto bg-primary hover:bg-primary/90"
					>
						{redirectCountdown > 0
							? `Continue (${redirectCountdown}s)`
							: 'Continue Now'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
