'use client'

import { Mail, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type ChangeEvent, useState } from 'react'

import { signUpAction } from '~/app/actions'
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
import { useFormValidation } from '~/hooks/use-form-validation'

export default function Signup() {
	const router = useRouter()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	const { isEmailInvalid, handleValidation, resetValidation } =
		useFormValidation({
			email: true,
		})

	const onEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
		handleValidation(e as ChangeEvent<HTMLInputElement & { name: 'email' }>)
		setEmail(e.target.value)
		if (error) setError('')
	}

	const onPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
		setPassword(e.target.value)
		if (error) setError('')
	}

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (isEmailInvalid || !email || !password) return

		setIsSubmitting(true)
		setError('')
		setSuccess('')

		try {
			const formData = new FormData()
			formData.append('email', email)
			formData.append('password', password)

			const result = await signUpAction(formData)

			if (result.success) {
				setSuccess(result.message)
				// Redirect to OTP validation after a brief delay
				setTimeout(() => {
					router.push('/otp-validation')
				}, 1500)
			} else {
				setError(result.message)
			}
		} catch (err) {
			setError('An unexpected error occurred. Please try again.')
		} finally {
			setIsSubmitting(false)
		}

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
							<h3> Enter your details below to create your account</h3>
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
										value={email}
									/>
									<span id="email-description" className="sr-only">
										Enter your email address to create your account
									</span>
									<span id="email-error" className="sr-only">
										Please enter a valid email address
									</span>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="password" id="password-label">
									Password
								</Label>
								<Input
									id="password"
									name="password"
									type="password"
									placeholder="Create a secure password"
									required
									aria-labelledby="password-label"
									aria-describedby="password-description"
									onChange={onPasswordChange}
									aria-required="true"
									value={password}
									minLength={6}
								/>
								<span id="password-description" className="sr-only">
									Create a password with at least 6 characters
								</span>
							</div>

							<Button
								className="w-full gradient-btn text-white"
								type="submit"
								disabled={isSubmitting || isEmailInvalid || !email || !password}
								aria-live="polite"
								aria-busy={isSubmitting}
							>
								{isSubmitting ? (
									'Creating account...'
								) : (
									<>
										Create account <UserPlus className="ml-2 h-4 w-4" />
									</>
								)}
							</Button>

							<PasskeyInfoDialog />

							{success && (
								<div
									className="text-green-600 text-sm text-center"
									role="alert"
									aria-live="polite"
								>
									{success}
								</div>
							)}

							{error && (
								<div
									className="text-red-600 text-sm text-center"
									role="alert"
									aria-live="assertive"
								>
									{error}
								</div>
							)}
						</div>
					</form>
				</CardContent>
				<CardFooter className="flex flex-col space-y-4 border-t p-6">
					<div className="text-center text-sm text-muted-foreground">
						Already have an account?{' '}
						<Link
							href="/sign-in"
							className="text-primary underline hover:text-primary/80"
						>
							Sign in
						</Link>
					</div>
				</CardFooter>
			</Card>
		</AuthLayout>
	)
}
