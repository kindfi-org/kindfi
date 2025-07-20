'use client'

import { Mail, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ChangeEvent } from 'react'

import { signUpAction } from '~/app/actions'
import { PasskeyInfoDialog } from '~/components/shared/passkey-info-dialog'

import { useSetState } from 'react-use'
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
import { cn } from '~/lib/utils'

export function SignupComponent() {
	const router = useRouter()
	const [{ email, isSubmitting, error, success }, setSignUpState] = useSetState(
		{
			email: '',
			isSubmitting: false,
			error: '',
			success: '',
		},
	)

	const { isEmailInvalid, doesEmailExist, handleValidation, resetValidation } =
		useFormValidation({
			email: true,
		})

	const onEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
		handleValidation(e as ChangeEvent<HTMLInputElement & { name: 'email' }>)
		setSignUpState({ email: e.target.value })
		if (error) setSignUpState({ error: '' })
	}

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (isEmailInvalid || !email) return

		setSignUpState({ isSubmitting: true, error: '', success: '' })

		try {
			const formData = new FormData()
			formData.append('email', email)

			const result = await signUpAction(formData)

			if (result.success) {
				setSignUpState({ success: result.message })
				// Redirect to OTP validation after a brief delay
				setTimeout(() => {
					router.push(result?.redirect || '/sign-up')
				}, 1500)
			} else {
				setSignUpState({ error: result.message })
			}
		} catch (err) {
			setSignUpState({
				error: 'An unexpected error occurred. Please try again.',
			})
		} finally {
			setSignUpState({ isSubmitting: false })
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
						{success && (
							<output
								className="text-green-600 text-sm text-center"
								role="alert"
								aria-live="polite"
							>
								{success}
							</output>
						)}

						{error && (
							<output
								className="text-red-600 text-sm text-center"
								role="alert"
								aria-live="assertive"
							>
								{error}
							</output>
						)}

						<div className="space-y-2">
							<Label htmlFor="email" id="email-label">
								Email
							</Label>
							<div className="space-y-1 pb-6 relative">
								<Mail
									className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
									aria-hidden="true"
								/>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="you@example.com"
									required
									aria-labelledby="email-label"
									aria-describedby={
										isEmailInvalid ? 'email-error' : 'email-description'
									}
									aria-invalid={isEmailInvalid}
									onChange={onEmailChange}
									aria-required="true"
									value={email}
									className={cn('pl-10', {
										'border-red-500 outline-none ring-2 ring-red-500':
											email &&
											(isEmailInvalid || (!isEmailInvalid && doesEmailExist)),
										'border-green-500 outline-none ring-2 ring-green-500':
											!isEmailInvalid && !doesEmailExist && email,
									})}
								/>
								{email &&
									(isEmailInvalid || (!isEmailInvalid && doesEmailExist)) && (
										<span
											className="text-red-600 text-sm absolute bottom-0 left-0 mt-1"
											role="alert"
											aria-live="polite"
										>
											{isEmailInvalid ? (
												'Please enter a valid email address.'
											) : (
												<>
													Account is already registered. Please{' '}
													<Link
														className="text-primary font-medium hover:underline"
														href="/sign-in"
													>
														sign in
													</Link>{' '}
													instead.
												</>
											)}
										</span>
									)}
							</div>
						</div>

						<Button
							className="w-full gradient-btn text-white"
							type="submit"
							disabled={isSubmitting || isEmailInvalid || !email}
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
					</form>
				</CardContent>
				<CardFooter className="flex flex-col space-y-4 border-t p-6">
					<div className="text-center text-muted-foreground">
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
