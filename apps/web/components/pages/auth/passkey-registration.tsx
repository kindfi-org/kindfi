'use client'

import { createSupabaseBrowserClient } from '@packages/lib/supabase-client'
import { CheckCircle, Shield, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { signOutAction } from '~/app/actions/auth'

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
import { useStellarContext } from '~/hooks/contexts/stellar-context'
import { usePasskeyRegistration } from '~/hooks/passkey/use-passkey-registration'
import { useWebAuthnSupport } from '~/hooks/passkey/use-web-authn-support'

export function PasskeyRegistrationComponent() {
	const router = useRouter()
	const [userEmail, setUserEmail] = useState('')
	const [userId, setUserId] = useState('')
	const isWebAuthnSupported = useWebAuthnSupport()
	const { onRegister } = useStellarContext()

	const {
		isCreatingPasskey,
		regSuccess,
		regError,
		isAlreadyRegistered,
		deviceData,
		handleRegister,
		reset,
	} = usePasskeyRegistration(userEmail, { onRegister, userId })

	// Retrieve Supabase auth user (pre-NextAuth) after OTP verify
	useEffect(() => {
		const supabase = createSupabaseBrowserClient()
		supabase.auth.getUser().then(({ data }) => {
			if (data.user?.email) {
				setUserEmail(data.user.email)
				setUserId(data.user.id || '')
			} else {
				router.push('/sign-up')
			}
		})
	}, [router])

	const handleSkipForNow = async () => {
		// Disclosure the session due user rejects to continue without passkey.
		try {
			await signOutAction()
		} catch (error) {
			console.error('Error signing out:', error)
			// Even if sign out fails, redirect to home
			router.push('/')
		}
	}

	// Finalize after successful passkey registration: update profile and sign in via NextAuth
	useEffect(() => {
		console.log('Passkey registration success effect triggered', {
			regSuccess,
			userEmail,
			userId,
			deviceData,
		})
		if (!regSuccess || !userEmail || !userId || !deviceData) {
			router.push('/sign-in')
			return () => {}
		}

		const timeout = setTimeout(() => {
			finalize()
			clearTimeout(timeout)
		}, 1000)

		async function finalize() {
			try {
				const supabase = createSupabaseBrowserClient()
				// Update profile with richer info (e.g. display name). Ignore result errors silently.
				await supabase
					.from('profiles')
					.update({
						display_name: userEmail.split('@')[0],
					})
					.eq('next_auth_user_id', userId)
				// Sign in through credentials provider once device/passkey ready
				await signIn('credentials', {
					redirect: false,
					userId,
					email: userEmail,
					credentialId: deviceData?.credentialId || '',
					pubKey: deviceData?.publicKey || '',
					address: deviceData?.address || '',
				})
				router.push('/profile')
			} catch (e) {
				console.error('Finalize passkey registration error', e)
				router.push('/sign-in')
			}
		}

		return () => {
			clearTimeout(timeout)
		}
	}, [regSuccess, userEmail, userId, router, deviceData])

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
							Your browser doesn't support passkeys. To be able to interact with
							the website, please use a browser that supports WebAuthn.
						</CardDescription>
					</CardHeader>
					<CardFooter>
						<Button onClick={handleSkipForNow} className="w-full">
							Return Home
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
							Redirecting you to your new profile...
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
									onClick={() => router.push('/profile?passkey=registered')}
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
