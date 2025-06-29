'use client'

import {
	AlertCircle,
	ArrowRight,
	CheckCircle,
	CheckCircle2,
	Shield,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { type SetStateAction, useEffect, useState } from 'react'

import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from '~/components/base/input-otp'
import { OTPTips } from '~/components/shared/otp-tips'

export default function VerifyOTPPage() {
	const router = useRouter()
	const [otp, setOtp] = useState('')
	const [timeLeft, setTimeLeft] = useState(120) // 2 minutes
	const [isVerifying, setIsVerifying] = useState(false)
	const [isVerified, setIsVerified] = useState(false)
	const [isResending, setIsResending] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	useEffect(() => {
		if (timeLeft > 0 && !isVerified) {
			const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
			return () => clearTimeout(timer)
		}
	}, [timeLeft, isVerified])

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60)
		const secs = seconds % 60
		return `${mins}:${secs < 10 ? '0' : ''}${secs}`
	}

	const handleOtpChange = (value: SetStateAction<string>) => {
		setOtp(value)

		// Clear any existing errors when user starts typing again
		if (error) setError('')
	}

	const handleVerify = async () => {
		if (otp.length !== 6) return

		setIsVerifying(true)
		setError('')

		try {
			// Since Supabase uses email link verification, this is primarily for demonstration
			// In a real implementation, you might use email OTP instead of email links
			await new Promise((resolve) => setTimeout(resolve, 1500))

			// For demo purposes - in real app, the verification happens via email link
			if (otp === '123456') {
				setIsVerified(true)
				setSuccess('Verification successful! Redirecting to passkey setup...')
				setTimeout(() => {
					router.push('/passkey-registration')
				}, 2000)
			} else {
				setError(
					'Invalid verification code. Please check your email and click the verification link.',
				)
			}
		} catch (err) {
			setError('Verification failed. Please try again.')
		} finally {
			setIsVerifying(false)
		}
	}

	const handleResend = async () => {
		setIsResending(true)
		setError('')

		try {
			// Simulate resending verification email
			await new Promise((resolve) => setTimeout(resolve, 1000))
			setTimeLeft(120)
			setSuccess('Verification email resent! Please check your inbox.')
		} catch (err) {
			setError('Failed to resend verification email. Please try again.')
		} finally {
			setIsResending(false)
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
			<div className="w-full max-w-5xl">
				<div className="grid gap-6 lg:grid-cols-[1fr_320px]">
					<Card className="w-full border-none">
						<CardHeader className="space-y-1">
							<div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
								<Shield className="h-6 w-6 text-primary" />
							</div>
							<CardTitle
								className="text-center text-2xl font-bold"
								id="otp-label"
							>
								Check Your Email
							</CardTitle>
							<CardDescription className="text-center">
								We've sent a verification link to your email address. Click the
								link to complete your account setup.
								<div className="mt-2 font-medium text-primary">
									Please check your inbox and spam folder
								</div>
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{isVerified ? (
								<div className="flex flex-col items-center justify-center space-y-2 py-4">
									<div className="rounded-full bg-green-100 p-2">
										<CheckCircle2 className="h-8 w-8 text-green-600" />
									</div>
									<p className="text-center text-lg font-medium text-green-600">
										Verification Successful!
									</p>
									<p className="text-center text-sm text-muted-foreground">
										Redirecting you to dashboard...
									</p>
								</div>
							) : (
								<>
									<fieldset className="space-y-4">
										<legend
											className="text-base text-center font-medium"
											id="otp-legend"
										>
											Verification Code
										</legend>
										<div className="flex justify-center">
											<InputOTP
												maxLength={6}
												value={otp}
												onChange={handleOtpChange}
												disabled={isVerifying || isVerified}
												aria-labelledby="otp-label"
												aria-describedby="otp-instructions"
												aria-invalid={!!error}
												aria-errormessage={error ? 'otp-error' : undefined}
												className="gap-3"
											>
												<p id="otp-instructions" className="sr-only">
													Enter the 6-digit code sent to your email or phone.
													Use the arrow keys to navigate.
												</p>
												<InputOTPGroup className="gap-3">
													<InputOTPSlot
														index={0}
														className={`h-14 w-14 rounded-md border-2 text-xl shadow-sm ${error ? 'border-red-500' : ''} ${isVerified ? 'border-green-500' : ''}`}
														aria-label="Digit 1"
													/>
													<InputOTPSlot
														index={1}
														className={`h-14 w-14 rounded-md border-2 text-xl shadow-sm ${error ? 'border-red-500' : ''} ${isVerified ? 'border-green-500' : ''}`}
														aria-label="Digit 2"
													/>
													<InputOTPSlot
														index={2}
														className={`h-14 w-14 rounded-md border-2 text-xl shadow-sm ${error ? 'border-red-500' : ''} ${isVerified ? 'border-green-500' : ''}`}
														aria-label="Digit 3"
													/>
													<InputOTPSlot
														index={3}
														className={`h-14 w-14 rounded-md border-2 text-xl shadow-sm ${error ? 'border-red-500' : ''} ${isVerified ? 'border-green-500' : ''}`}
														aria-label="Digit 4"
													/>
													<InputOTPSlot
														index={4}
														className={`h-14 w-14 rounded-md border-2 text-xl shadow-sm ${error ? 'border-red-500' : ''} ${isVerified ? 'border-green-500' : ''}`}
														aria-label="Digit 5"
													/>
													<InputOTPSlot
														index={5}
														className={`h-14 w-14 rounded-md border-2 text-xl shadow-sm ${error ? 'border-red-500' : ''} ${isVerified ? 'border-green-500' : ''}`}
														aria-label="Digit 6"
													/>
												</InputOTPGroup>
											</InputOTP>
										</div>

										{/* Status indicator */}
										{isVerifying && (
											<div
												className="text-center text-sm text-muted-foreground"
												aria-live="polite"
											>
												Verifying code...
											</div>
										)}

										{/* Error message */}
										{error && (
											<div
												id="otp-error"
												className="flex items-center justify-center gap-2 text-sm text-red-500"
												aria-live="assertive"
											>
												<AlertCircle className="h-4 w-4" aria-hidden="true" />
												{error}
											</div>
										)}

										{/* Success message */}
										{success && (
											<div
												id="otp-success"
												className="flex items-center justify-center gap-2 text-sm text-green-500"
												aria-live="assertive"
											>
												<CheckCircle className="h-4 w-4" aria-hidden="true" />
												{success}
											</div>
										)}

										{/* Current input announcement for screen readers */}
										<div className="sr-only" aria-live="polite">
											{otp ? `Current input: ${otp.split('').join(' ')}` : ''}
										</div>
									</fieldset>

									<div className="text-center text-sm">
										{timeLeft > 0 ? (
											<p>
												Code expires in{' '}
												<span className="font-medium text-primary">
													{formatTime(timeLeft)}
												</span>
											</p>
										) : (
											<p className="text-destructive">Code expired</p>
										)}
									</div>
								</>
							)}
						</CardContent>
						<CardFooter className="flex flex-col space-y-2">
							{!isVerified && (
								<>
									<Button
										className="w-full gap-2"
										onClick={handleVerify}
										disabled={otp.length !== 6 || isVerifying || timeLeft <= 0}
									>
										{isVerifying ? 'Verifying...' : 'Verify Code'}
										{!isVerifying && <ArrowRight className="h-4 w-4" />}
									</Button>

									<div className="flex items-center justify-center space-x-1 pt-2">
										<span className="text-sm text-muted-foreground">
											Didn't receive the code?
										</span>
										<Button
											variant="link"
											className="h-auto p-0 text-sm"
											onClick={handleResend}
											disabled={isResending || timeLeft > 0}
										>
											{isResending ? 'Sending...' : 'Resend'}
										</Button>
									</div>
								</>
							)}
						</CardFooter>
					</Card>

					{/* Tips section - automatically responsive with grid */}
					<div className="self-start lg:self-center">
						<OTPTips />
					</div>
				</div>
			</div>
		</div>
	)
}
