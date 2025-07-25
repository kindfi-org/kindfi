'use client'

import { Fingerprint } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type ChangeEvent, useEffect, useState } from 'react'
import { signInAction } from '~/app/actions/auth'
import { Button } from '~/components/base/button'
import { Card, CardContent, CardHeader } from '~/components/base/card'
import { Input } from '~/components/base/input'
import { Label } from '~/components/base/label'
import { AuthLayout } from '~/components/shared/layout/auth/auth-layout'
import { PasskeyInfoDialog } from '~/components/shared/passkey-info-dialog'
import { usePasskeyAuthentication } from '~/hooks/passkey/use-passkey-authentication'
import { useStellarContext } from '~/hooks/stellar/stellar-context'
import { useFormValidation } from '~/hooks/use-form-validation'

export default function Login() {
	const [email, setEmail] = useState('')
	const router = useRouter()

	const {
		onSign,
		prepareSign,
		deployee: stellarUserAddress,
	} = useStellarContext()

	const {
		isAuthenticating,
		authSuccess,
		authError,
		handleAuth,
		isNotRegistered,
	} = usePasskeyAuthentication(email, { onSign, prepareSign })

	const { isEmailInvalid, handleValidation, resetValidation } =
		useFormValidation({
			email: true,
		})

	const onEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
		handleValidation(e as ChangeEvent<HTMLInputElement & { name: 'email' }>)
		setEmail(e.target.value)
	}

	const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (!isEmailInvalid) handleAuth()
		resetValidation()
	}

	useEffect(() => {
		if (authSuccess) {
			// If the user is authenticated, we can use the stellarUserAddress later
			console.log('stellarUserAddress', stellarUserAddress)
			router.push('/')
		}
	}, [authSuccess, router, stellarUserAddress])

	return (
		<AuthLayout>
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-2">
					<div className="flex justify-between mb-4">
						<div className="flex-col">
							<h1 className="gradient-text text-2xl mb-2 text-start font-semibold tracking-tight">
								Welcome Back
							</h1>
							<h2>Sign in with your passkey to continue</h2>
						</div>
						<div className="flex justify-center items-center rounded-full bg-blue-500/10 w-12 h-12">
							<Fingerprint className="h-6 w-6 text-primary text-2xl" />
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<form className="space-y-4" aria-label="Sign in" onSubmit={onSubmit}>
						<div className="space-y-2">
							<Label htmlFor="email" id="email-label">
								Email
							</Label>
							<div className="space-y-1">
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="you@example.com"
									required
									aria-labelledby="email-label"
									aria-describedby={`${
										isEmailInvalid ? 'email-error' : 'email-description'
									}`}
									aria-invalid={isEmailInvalid}
									onChange={onEmailChange}
									aria-required="true"
								/>
								<span id="email-description" className="sr-only">
									Please enter your registered email address
								</span>
								<span id="email-error" className="sr-only">
									Please enter a valid email address
								</span>
							</div>
						</div>

						<Button
							size="lg"
							className="gradient-btn text-white w-full mt-10"
							formAction={signInAction}
							aria-live="polite"
							aria-busy={isAuthenticating}
						>
							{isAuthenticating ? (
								'Authenticating...'
							) : (
								<>
									Sign in with passkey <Fingerprint />
								</>
							)}
						</Button>

						<div className="text-sm text-center text-muted-foreground my-8">
							Don&apos;t have an account yet?{' '}
							<Link
								className="text-primary font-medium hover:underline"
								href="/sign-up"
							>
								Create new one
							</Link>
						</div>

						<hr />

						{isNotRegistered && (
							<div
								className="text-yellow-600"
								role="alert"
								aria-live="assertive"
							>
								User not registered. Please Sign Up first.
							</div>
						)}

						{authError && !isNotRegistered && (
							<div className="text-red-600" role="alert" aria-live="assertive">
								There was an error during authentication. Please try again.
							</div>
						)}

						{authSuccess && (
							<output className="text-green-600" aria-live="polite">
								Authentication successful! Redirecting...
							</output>
						)}
						<PasskeyInfoDialog />
					</form>
				</CardContent>
			</Card>
		</AuthLayout>
	)
}
