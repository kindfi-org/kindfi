'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type ChangeEvent, useEffect, useState } from 'react'
import { signInAction } from '~/app/actions'
import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import { Label } from '~/components/base/label'
import { AuthForm } from '~/components/shared/layout/auth/auth-form'
import { AuthLayout } from '~/components/shared/layout/auth/auth-layout'
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
			<AuthForm
				title="Welcome Back"
				subtitle={
					<div className="text-sm text-muted-foreground">
						Don&apos;t have an account?{' '}
						<Link
							className="text-primary font-medium hover:underline"
							href="/sign-up"
						>
							Sign Up
						</Link>
					</div>
				}
			>
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
								aria-describedby={`${isEmailInvalid ? 'email-error' : 'email-description'}`}
								aria-invalid={isEmailInvalid}
								onChange={onEmailChange}
							/>
							<span id="email-description" className="sr-only">
								Please enter your registered email address
							</span>
							<span id="email-error" className="sr-only">
								Please enter a valid email address
							</span>
						</div>
					</div>

					<Button className="w-full" formAction={signInAction}>
						{isAuthenticating ? 'Authenticating...' : 'Log In'}
					</Button>

					{isNotRegistered && (
						<div className="text-yellow-600">
							User not registered. Please Sign Up first.
						</div>
					)}

					{authError && !isNotRegistered && (
						<div className="text-red-600">
							There was an error during authentication. Please try again.
						</div>
					)}
				</form>
			</AuthForm>
		</AuthLayout>
	)
}
