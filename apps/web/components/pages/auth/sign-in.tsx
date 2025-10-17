'use client'

import { Fingerprint } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type ChangeEvent, useEffect, useState } from 'react'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from '~/components/base/card'
import { Input } from '~/components/base/input'
import { Label } from '~/components/base/label'
import { AuthLayout } from '~/components/shared/layout/auth/auth-layout'
import { PasskeyInfoDialog } from '~/components/shared/passkey-info-dialog'
import { useStellarContext } from '~/hooks/contexts/stellar-context'
import { usePasskeyAuthentication } from '~/hooks/passkey/use-passkey-authentication'
import { useFormValidation } from '~/hooks/use-form-validation'
import { useI18n } from '~/lib/i18n'
import { cn } from '~/lib/utils'

export function LoginComponent() {
	const [email, setEmail] = useState('')
	const _router = useRouter()
	const { t } = useI18n()

	const {
		onSign,
		prepareSign,
		deployee: stellarUserAddress,
	} = useStellarContext()

	const { isEmailInvalid, doesEmailExist, handleValidation, resetValidation } =
		useFormValidation({
			email: true,
		})

	const {
		isAuthenticating,
		authSuccess,
		authError,
		handleAuth,
		isNotRegistered,
	} = usePasskeyAuthentication(email, {
		onSign,
		prepareSign,
		userId: doesEmailExist,
	})

	const onEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
		handleValidation(e as ChangeEvent<HTMLInputElement & { name: 'email' }>)
		const emailValue = e.target.value.trim()
		setEmail(emailValue)
	}

	const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		e.stopPropagation()
		if (!isEmailInvalid) handleAuth()
		resetValidation()
	}

	useEffect(() => {
		if (authSuccess) {
			// If the user is authenticated, we can use the stellarUserAddress later
			console.log('stellarUserAddress', stellarUserAddress)
			// router.push('/dashboard')
		}
	}, [authSuccess, stellarUserAddress])

	return (
		<AuthLayout>
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-2">
					<div className="flex justify-between mb-4">
					<div className="flex-col">
						<h1 className="gradient-text text-2xl mb-2 text-start font-semibold tracking-tight">
							{t('auth.welcomeBack')}
						</h1>
						<h2>{t('auth.signInSubtitle')}</h2>
					</div>
						<div className="flex justify-center items-center rounded-full bg-blue-500/10 w-12 h-12">
							<Fingerprint className="h-6 w-6 text-primary text-2xl" />
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<form className="space-y-4" aria-label="Sign in" onSubmit={onSubmit}>
					{isNotRegistered && (
						<legend
							className="border border-zinc-600/50 rounded-lg p-4 space-y-4 text-yellow-600"
							role="alert"
							aria-live="assertive"
						>
							{t('auth.deviceNotFound')}{' '}
							<Link
								className="text-primary font-medium hover:underline"
								href="/sign-up"
							>
								{t('auth.signUp')}
							</Link>{' '}
							{t('auth.first')}.
						</legend>
					)}

					{authError && !isNotRegistered && (
						<legend
							className="border border-zinc-600/50 rounded-lg p-4 space-y-4 text-red-600"
							role="alert"
							aria-live="assertive"
						>
							{t('auth.authError')}
						</legend>
					)}

					{authSuccess && (
						<output className="text-green-600" aria-live="polite">
							{t('auth.authSuccess')}
						</output>
					)}
					<div className="space-y-2">
						<Label htmlFor="email" id="email-label">
							{t('auth.email')}
						</Label>
						<div className="space-y-1 pb-6 relative">
							<Input
								id="email"
								name="email"
								type="email"
								placeholder={t('auth.emailPlaceholder')}
									required
									aria-labelledby="email-label"
									aria-describedby={`${isEmailInvalid ? 'email-error' : 'email-description'}`}
									aria-invalid={isEmailInvalid}
									onChange={onEmailChange}
									aria-required="true"
									className={cn({
										'border-red-500 outline-none ring-2 ring-red-500':
											isEmailInvalid ||
											(!isEmailInvalid && !doesEmailExist && email),
										'border-green-500 outline-none ring-2 ring-green-500':
											!isEmailInvalid && doesEmailExist,
									})}
								/>
							{isEmailInvalid && (
								<span
									className="text-red-600 text-sm absolute bottom-0 left-0 mt-1"
									role="alert"
									aria-live="assertive"
								>
									{t('auth.invalidEmail')}
								</span>
							)}
							{!isEmailInvalid && !doesEmailExist && email && (
								<span
									className="text-red-600 text-sm absolute bottom-0 left-0 mt-1"
									role="alert"
									aria-live="polite"
								>
									{t('auth.accountNotRegistered')}{' '}
									<Link
										className="text-primary font-medium hover:underline"
										href="/sign-up"
									>
										{t('auth.signUp')}
									</Link>{' '}
									{t('auth.first')}.
								</span>
							)}
							</div>
						</div>

					<Button
						size="lg"
						className="gradient-btn text-white w-full mt-10"
						type="submit"
						// formAction={signInAction}
						aria-live="polite"
						aria-busy={isAuthenticating}
						disabled={
							!email || !doesEmailExist || isAuthenticating || isEmailInvalid
						}
					>
						{isAuthenticating ? (
							t('auth.authenticating')
						) : (
							<>
								{t('auth.signInWithPasskey')} <Fingerprint />
							</>
						)}
					</Button>
						<PasskeyInfoDialog />
					</form>
				</CardContent>
			<CardFooter className="flex flex-col space-y-4 border-t p-6">
				<div className="text-sm text-center text-muted-foreground">
					{t('auth.dontHaveAccount')}{' '}
					<Link
						className="text-primary font-medium hover:underline"
						href="/sign-up"
					>
						{t('auth.createNewOne')}
					</Link>
				</div>
			</CardFooter>
			</Card>
		</AuthLayout>
	)
}
