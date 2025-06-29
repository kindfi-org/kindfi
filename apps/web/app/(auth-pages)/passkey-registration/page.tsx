'use client'

import { CheckCircle, Shield, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { AuthLayout } from '~/components/shared/layout/auth/auth-layout'
import { PasskeyInfoDialog } from '~/components/shared/passkey-info-dialog'
import { usePasskeyRegistration } from '~/hooks/passkey/use-passkey-registration'
import { useWebAuthnSupport } from '~/hooks/passkey/use-web-authn-support'
import { useStellarContext } from '~/hooks/stellar/stellar-context'

export default function PasskeyRegistrationPage() {
	const router = useRouter()
	const [userEmail, setUserEmail] = useState('')
	const isWebAuthnSupported = useWebAuthnSupport()
	const { onRegister } = useStellarContext()

	const {
		isCreatingPasskey,
		regSuccess,
		regError,
		handleRegister,
		isAlreadyRegistered,
		reset,
	} = usePasskeyRegistration(userEmail, { onRegister })

	// Get user email from current session
	useEffect(() => {
		const getUserEmail = async () => {
			try {
				const response = await fetch('/api/auth/user')
				if (response.ok) {
					const { user } = await response.json()
					if (user?.email) {
						setUserEmail(user.email)
					} else {
						// If no user session, redirect to sign-up
						router.push('/sign-up')
					}
				}
			} catch (error) {
				console.error('Error getting user:', error)
				router.push('/sign-up')
			}
		}

		getUserEmail()
	}, [router])

	const handleSkipForNow = () => {
		// Complete registration without passkey
		router.push('/dashboard?passkey=skipped')
	}

	useEffect(() => {
		if (regSuccess) {
			// Wait a moment then redirect to dashboard
			const timer = setTimeout(() => {
				router.push('/dashboard?passkey=registered')
			}, 2000)
			return () => clearTimeout(timer)
		}
	}, [regSuccess, router])

	if (!isWebAuthnSupported) {
		return (
			<AuthLayout>
				<Card className="w-full max-w-md">
					<CardHeader className="space-y-2 text-center">
						<div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
							<Shield className="h-6 w-6 text-destructive" />
						</div>
						<CardTitle className="text-2xl font-bold">
							WebAuthn Not Supported
						</CardTitle>
						<CardDescription>
							Your browser doesn't support passkeys. You can still use your
							account, but you'll need to use traditional password-based
							authentication.
						</CardDescription>
					</CardHeader>
					<CardFooter>
						<Button onClick={handleSkipForNow} className="w-full">
							Continue to Dashboard
						</Button>
					</CardFooter>
				</Card>
			</AuthLayout>
		)
	}

	if (regSuccess) {
		return (
			<AuthLayout>
				<Card className="w-full max-w-md">
					<CardHeader className="space-y-2 text-center">
						<div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
							<CheckCircle className="h-6 w-6 text-green-600" />
						</div>
						<CardTitle className="text-2xl font-bold text-green-600">
							Passkey Registered!
						</CardTitle>
						<CardDescription>
							Your passkey has been successfully registered. You can now use it
							to sign in securely.
						</CardDescription>
					</CardHeader>
					<CardContent className="text-center">
						<p className="text-sm text-muted-foreground">
							Redirecting you to dashboard...
						</p>
					</CardContent>
				</Card>
			</AuthLayout>
		)
	}

	return (
		<AuthLayout>
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-2 text-center">
					<div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
						<Shield className="h-6 w-6 text-primary" />
					</div>
					<CardTitle className="text-2xl font-bold">
						Set Up Your Passkey
					</CardTitle>
					<CardDescription>
						Complete your account setup by registering a passkey for secure,
						passwordless authentication.
						{userEmail && (
							<span className="block mt-2 font-medium text-primary">
								{userEmail}
							</span>
						)}
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-4">
					<div className="space-y-4">
						<div className="text-sm text-muted-foreground space-y-2">
							<p>
								<strong>What is a passkey?</strong>
							</p>
							<p>
								A passkey is a secure, passwordless way to sign in using your
								device's biometrics (like Face ID or fingerprint) or security
								key.
							</p>
						</div>

						<Button
							className="w-full gradient-btn text-white"
							onClick={handleRegister}
							disabled={isCreatingPasskey || !userEmail}
							aria-live="polite"
							aria-busy={isCreatingPasskey}
						>
							{isCreatingPasskey ? (
								'Creating passkey...'
							) : (
								<>
									Register Passkey <UserPlus className="ml-2 h-4 w-4" />
								</>
							)}
						</Button>

						<PasskeyInfoDialog />

						{regError && !isAlreadyRegistered && (
							<div
								className="text-red-600 text-sm text-center"
								role="alert"
								aria-live="assertive"
							>
								{regError}
								<Button
									variant="link"
									onClick={reset}
									className="ml-2 text-red-600 underline"
								>
									Try Again
								</Button>
							</div>
						)}

						{isAlreadyRegistered && (
							<div
								className="text-yellow-600 text-sm text-center"
								role="alert"
								aria-live="assertive"
							>
								A passkey is already registered for this email.
								<Button
									variant="link"
									onClick={() => router.push('/dashboard?passkey=registered')}
									className="ml-2 text-yellow-600 underline"
								>
									Continue
								</Button>
							</div>
						)}
					</div>
				</CardContent>

				<CardFooter className="flex flex-col space-y-2">
					<Button
						variant="outline"
						onClick={handleSkipForNow}
						className="w-full"
					>
						Skip for now
					</Button>
					<p className="text-xs text-muted-foreground text-center">
						You can set up a passkey later in your account settings.
					</p>
					<div className="text-center text-sm text-muted-foreground">
						Need help?{' '}
						<Link
							href="/support"
							className="text-primary underline hover:text-primary/80"
						>
							Contact Support
						</Link>
					</div>
				</CardFooter>
			</Card>
		</AuthLayout>
	)
}
