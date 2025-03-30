'use client'

import { Mail, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { type ChangeEvent, useState } from 'react'

import { PasskeyInfoDialog } from '~/components/shared/passkey-info-dialog'

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
import { usePasskeyRegistration } from '~/hooks/passkey/use-passkey-registration'
import { useWebAuthnSupport } from '~/hooks/passkey/use-web-authn-support'
import { useStellarContext } from '~/hooks/stellar/stellar-context'
import { useFormValidation } from '~/hooks/use-form-validation'

export default function Signup() {
	// Show success message if registration was successful
	// if (searchParams.success) {
	//   return (
	//     <div className="w-full flex items-center justify-center p-4">
	//       <Card className="w-full max-w-md">
	//         <CardContent className="pt-6">
	//           <FormMessage message={searchParams} />
	//         </CardContent>
	//       </Card>
	//     </div>
	//   );
	// }

	const isWebAuthnSupported = useWebAuthnSupport()

	const { onRegister } = useStellarContext()

	const [email, setEmail] = useState('')

	const {
		isCreatingPasskey,
		regSuccess,
		regError,
		handleRegister,
		isAlreadyRegistered,
	} = usePasskeyRegistration(email, { onRegister })

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
		if (!isEmailInvalid) handleRegister()
		resetValidation()
	}

	return (
		<AuthLayout>
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-2 text-center">
					<div className="flex justify-between mb-4">
						<div className="flex-col">
							<h1 className="gradient-text text-2xl mb-2 text-start font-semibold tracking-tight">
								Create an account
							</h1>
							<h3> Enter your email below to create your account</h3>
						</div>
						<div className="flex justify-center items-center rounded-full bg-blue-500/10 w-12 h-12">
							<UserPlus className="h-6 w-6 text-primary" />
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<form className="space-y-4" aria-label="Sign up" onSubmit={onSubmit}>
						<div className="space-y-6">
							<div className="space-y-2">
								<Label htmlFor="email" id="email-label">
									Email
								</Label>
								<div className="relative">
									<Mail
										className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
										aria-hidden="true"
									/>
									<Input
										id="email"
										name="email"
										type="email"
										placeholder="you@example.com"
										className="pl-10"
										required
										aria-labelledby="email-label"
										aria-describedby={
											isEmailInvalid ? 'email-error' : 'email-description'
										}
										aria-invalid={isEmailInvalid}
										onChange={onEmailChange}
										aria-required="true"
									/>
									<span id="email-description" className="sr-only">
										Enter your email address to create your account
									</span>
									<span id="email-error" className="sr-only">
										Please enter a valid email address
									</span>
								</div>
							</div>

							{isWebAuthnSupported ? (
								<>
									<Button
										className="w-full"
										type="submit"
										disabled={isCreatingPasskey}
										aria-live="polite"
										aria-busy={isCreatingPasskey}
										tabIndex={0}
									>
										<>
											Create account with passkey <UserPlus className="ml-2" />
										</>
									</Button>
									<PasskeyInfoDialog />
								</>
							) : (
								<div className="flex flex-col items-center justify-center">
									<span>
										WebAuthn is not supported. Please use a different browser.
									</span>
								</div>
							)}

							{regSuccess && (
								<div
									className="text-green-600"
									role="status"
									aria-live="polite"
								>
									Registration successful! You can now sign in.
								</div>
							)}

							{regError && !isAlreadyRegistered && (
								<div
									className="text-red-600"
									role="alert"
									aria-live="assertive"
								>
									There was an error during registration. Please try again.
								</div>
							)}

							{isAlreadyRegistered && (
								<div
									className="text-yellow-600"
									role="alert"
									aria-live="assertive"
								>
									This email is already registered. Please sign in.
								</div>
							)}
						</div>

						{/* <FormMessage message={searchParams} /> */}
					</form>
				</CardContent>
				<CardFooter className="flex flex-col space-y-4 border-t p-6">
					<div className="text-center text-sm text-muted-foreground">
						Already have an account?{' '}
						<Link
							href="/sign-in"
							className="text-primary underline hover:text-primary/80"
							tabIndex={0}
						>
							Sign in
						</Link>
					</div>
				</CardFooter>
			</Card>
		</AuthLayout>
	)
}
