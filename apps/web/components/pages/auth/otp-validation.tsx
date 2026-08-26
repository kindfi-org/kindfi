'use client'

import { createSupabaseBrowserClient } from '@packages/lib/supabase-client'
import { ArrowRight, CheckCircle2, Mail, Shield } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { type FormEvent, useEffect, useId, useRef, useState } from 'react'
import { logger } from '@/lib/logger'
import { resendSignUpOtpAction } from '~/app/actions/sign-up'
import { Button } from '~/components/base/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '~/components/base/input-otp'
import { FormAlert } from '~/components/shared/form/form-alert'
import { FormShell } from '~/components/shared/form/form-shell'
import { AuthLayout } from '~/components/shared/layout/auth/auth-layout'
import { OTPTips } from '~/components/shared/otp-tips'
import { formLayoutClasses } from '~/lib/form/form-styles'
import { useI18n } from '~/lib/i18n'
import { cn } from '~/lib/utils'

const CODE_EXPIRY_SECONDS = 120
const RESEND_COOLDOWN_SECONDS = 60
const OTP_LENGTH = 6
const OTP_SLOT_KEYS = ['otp-0', 'otp-1', 'otp-2', 'otp-3', 'otp-4', 'otp-5'] as const

const formatTime = (seconds: number) => {
	const mins = Math.floor(seconds / 60)
	const secs = seconds % 60
	return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function VerifyOTPComponent() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { t } = useI18n()
	const formRef = useRef<HTMLFormElement>(null)
	const errorRef = useRef<HTMLDivElement>(null)

	const [otp, setOtp] = useState('')
	const [timeLeft, setTimeLeft] = useState(CODE_EXPIRY_SECONDS)
	const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS)
	const [isVerifying, setIsVerifying] = useState(false)
	const [isVerified, setIsVerified] = useState(false)
	const [isResending, setIsResending] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	const email = searchParams.get('email') ?? ''

	const legendId = useId()
	const instructionsId = useId()

	useEffect(() => {
		if (!email) {
			router.replace('/sign-up')
		}
	}, [email, router])

	useEffect(() => {
		if (isVerified) return

		const interval = window.setInterval(() => {
			setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
			setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0))
		}, 1000)

		return () => window.clearInterval(interval)
	}, [isVerified])

	useEffect(() => {
		if (!error) return
		errorRef.current?.focus()
	}, [error])

	useEffect(() => {
		if (otp.length !== OTP_LENGTH || isVerifying || isVerified || timeLeft <= 0) return
		formRef.current?.requestSubmit()
	}, [otp, isVerifying, isVerified, timeLeft])

	const handleOtpChange = (value: string) => {
		setOtp(value)
		if (error) setError('')
		if (success) setSuccess('')
	}

	const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (otp.length !== OTP_LENGTH || isVerifying || timeLeft <= 0) return

		setIsVerifying(true)
		setError('')
		setSuccess('')

		try {
			const supabase = createSupabaseBrowserClient()
			const { data, error: verifyError } = await supabase.auth.verifyOtp({
				email,
				token: otp,
				type: 'email',
			})

			if (verifyError) {
				throw verifyError
			}

			if (data.user) {
				try {
					const { error: profileInsertError } = await supabase.from('profiles').insert({
						id: data.user.id,
						next_auth_user_id: data.user.id,
						display_name: (data.user.email || '').split('@')[0] || null,
						role: 'pending',
						bio: null,
						image_url: null,
					})
					if (profileInsertError) {
						logger.warn('Profile insert warning:', profileInsertError.message)
					}
				} catch (profileErr) {
					logger.warn('Profile insert (non-fatal) error:', profileErr)
				}

				setIsVerified(true)
				setSuccess(t('auth.otpRedirecting'))
				window.setTimeout(() => {
					router.push('/passkey-registration')
				}, 1200)
			}
		} catch (err) {
			logger.error('OTP verification error:', err)
			setError(err instanceof Error ? err.message : t('auth.otpVerificationFailed'))
		} finally {
			setIsVerifying(false)
		}
	}

	const handleResend = async () => {
		if (!email) {
			setError(t('auth.otpEmailNotFound'))
			return
		}

		setIsResending(true)
		setError('')
		setSuccess('')

		try {
			const result = await resendSignUpOtpAction(email)

			if (!result.success) {
				throw new Error(result.message)
			}

			setTimeLeft(CODE_EXPIRY_SECONDS)
			setResendCooldown(RESEND_COOLDOWN_SECONDS)
			setOtp('')
			setSuccess(result.message)
		} catch (err) {
			logger.error('Resend OTP error:', err)
			setError(err instanceof Error ? err.message : t('auth.otpResendFailed'))
		} finally {
			setIsResending(false)
		}
	}

	const slotClassName = cn(
		'h-11 w-10 rounded-xl border-2 border-slate-200 bg-white text-center text-lg font-semibold tabular-nums shadow-sm sm:h-12 sm:w-11 sm:text-xl md:h-14 md:w-12',
		'focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20',
		error &&
			'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20',
	)

	if (!email) {
		return null
	}

	return (
		<AuthLayout contentMaxWidth="lg" aside={<OTPTips variant="panel" />}>
			<FormShell
				className="w-full max-w-none"
				maxWidth="lg"
				title={t('auth.otpTitle')}
				subtitle={t('auth.otpSpamHint')}
				icon={Shield}
				footer={
					<div className="w-full text-center text-sm text-muted-foreground">
						{t('auth.otpWrongEmail')}{' '}
						<Link href="/sign-up" className="font-medium text-primary hover:underline">
							{t('auth.otpStartOver')}
						</Link>
					</div>
				}
			>
				{isVerified ? (
					<div className="flex flex-col items-center justify-center space-y-3 py-6">
						<div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
							<CheckCircle2 className="h-8 w-8 text-primary" aria-hidden="true" />
						</div>
						<p className="text-balance text-center text-lg font-semibold text-slate-900">
							{t('auth.otpVerifyingSuccess')}
						</p>
						<p className="text-center text-sm text-muted-foreground">{t('auth.otpRedirecting')}</p>
					</div>
				) : (
					<form
						ref={formRef}
						className={formLayoutClasses.stack}
						aria-label={t('auth.otpFormLabel')}
						onSubmit={handleVerify}
					>
						<div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200/80 bg-[#fafbfc] px-4 py-3">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
								<Mail className="h-4 w-4" aria-hidden="true" />
							</div>
							<div className="min-w-0">
								<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
									{t('auth.otpSubtitle')}
								</p>
								<p className="truncate text-sm font-semibold text-slate-900" translate="no">
									{email}
								</p>
							</div>
						</div>

						{success ? <FormAlert variant="success">{success}</FormAlert> : null}
						{error ? (
							<FormAlert variant="error">
								<div ref={errorRef} tabIndex={-1} className="outline-none">
									{error}
								</div>
							</FormAlert>
						) : null}

						<fieldset className="space-y-5">
							<legend id={legendId} className="sr-only">
								{t('auth.otpCodeLabel')}
							</legend>

							<div className="space-y-2 text-center">
								<p className="text-sm font-medium text-slate-800">{t('auth.otpCodeLabel')}</p>
								<p className="text-xs text-muted-foreground">{t('auth.otpInstructions')}</p>
							</div>

							<div className="flex justify-center overflow-x-auto px-1 pb-1">
								<InputOTP
									maxLength={OTP_LENGTH}
									value={otp}
									onChange={handleOtpChange}
									disabled={isVerifying}
									inputMode="numeric"
									autoComplete="one-time-code"
									spellCheck={false}
									aria-labelledby={legendId}
									aria-describedby={instructionsId}
									aria-invalid={Boolean(error)}
									className="gap-1.5 sm:gap-2 md:gap-3"
								>
									<p id={instructionsId} className="sr-only">
										{t('auth.otpInstructions')}
									</p>
									<InputOTPGroup className="gap-1.5 sm:gap-2 md:gap-3">
										{OTP_SLOT_KEYS.map((slotKey, index) => (
											<InputOTPSlot
												key={slotKey}
												index={index}
												className={slotClassName}
												aria-label={`Digit ${index + 1}`}
											/>
										))}
									</InputOTPGroup>
								</InputOTP>
							</div>

							{isVerifying ? (
								<p className="text-center text-sm text-muted-foreground" aria-live="polite">
									{t('auth.otpVerifying')}
								</p>
							) : null}

							<div className="sr-only" aria-live="polite">
								{otp ? `Current input: ${otp.split('').join(' ')}` : ''}
							</div>
						</fieldset>

						<div className="flex justify-center">
							<div
								className={cn(
									'inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm',
									timeLeft > 0
										? 'border-slate-200 bg-[#fafbfc] text-slate-700'
										: 'border-destructive/20 bg-destructive/5 text-destructive',
								)}
							>
								{timeLeft > 0 ? (
									<>
										<span>{t('auth.otpCodeExpires')}</span>
										<span className="font-semibold tabular-nums text-primary">
											{formatTime(timeLeft)}
										</span>
									</>
								) : (
									<span>{t('auth.otpCodeExpired')}</span>
								)}
							</div>
						</div>

						<Button
							className="gradient-btn w-full gap-2 text-white"
							type="submit"
							disabled={otp.length !== OTP_LENGTH || isVerifying || timeLeft <= 0}
							aria-busy={isVerifying}
						>
							{isVerifying ? t('auth.otpVerifying') : t('auth.otpVerifyBtn')}
							{!isVerifying ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
						</Button>

						<div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 text-center text-sm">
							<span className="text-muted-foreground">{t('auth.otpDidntReceive')}</span>
							{resendCooldown > 0 ? (
								<span className="text-muted-foreground">
									{t('auth.otpResendIn')}{' '}
									<span className="font-medium tabular-nums text-primary">
										{formatTime(resendCooldown)}
									</span>
								</span>
							) : (
								<Button
									variant="link"
									type="button"
									className="h-auto p-0 text-sm font-medium"
									onClick={handleResend}
									disabled={isResending}
								>
									{isResending ? t('auth.otpResending') : t('auth.otpResend')}
								</Button>
							)}
						</div>

						<div className="lg:hidden">
							<OTPTips variant="inline" />
						</div>
					</form>
				)}
			</FormShell>
		</AuthLayout>
	)
}
