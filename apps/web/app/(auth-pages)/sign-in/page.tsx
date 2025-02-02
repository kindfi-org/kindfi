'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { signInAction } from '~/app/actions'
import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import { Label } from '~/components/base/label'
import type { Message } from '~/components/form-message'
import { AuthForm } from '~/components/shared/layout/auth/auth-form'
import { AuthLayout } from '~/components/shared/layout/auth/auth-layout'
import { useFormValidation } from '~/hooks/use-form-validation'
import { handleClientAuthError } from '~/lib/auth/clientauth-error-handler'
import type { AuthResponse } from '~/lib/types/auth'

export default function Login(props: { searchParams: Promise<Message> }) {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [authResponse, setAuthResponse] = useState<AuthResponse | null>(null)
	const {
		isEmailInvalid,
		isPasswordInvalid,
		handleValidation,
		resetValidation,
	} = useFormValidation({
		email: true,
		password: true,
		minLength: 6,
	})

	useEffect(() => {
		const error = searchParams.get('error')
		if (error) {
			toast.error(decodeURIComponent(error))
		}
	}, [searchParams, toast])

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		resetValidation()

		const formData = new FormData(event.currentTarget)
		try {
			const response = await signInAction(formData)
			setAuthResponse(response)
			if (!response.success) {
				toast.error(response.message)
			} else {
				toast.success('You have successfully logged in.')
				router.push(response.redirect || '/dashboard')
			}
		} catch (error: any) {
			const errorResponse = handleClientAuthError(error)
			setAuthResponse(errorResponse)
			toast.error(errorResponse.message)
		}
	}

	return (
		<AuthLayout>
			<AuthForm
				title="Welcome Back"
				subtitle={
					<div className="text-sm text-muted-foreground">
						Don&apos;t have an account?
						<Link
							className="text-primary font-medium hover:underline"
							href="/sign-up"
						>
							Sign Up
						</Link>
					</div>
				}
			>
				<form
					className="space-y-4"
					aria-label="Sign in"
					onSubmit={handleSubmit}
				>
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
								onChange={handleValidation}
							/>
							<span id="email-description" className="sr-only">
								Please enter your registered email address
							</span>
							<span id="email-error" className="sr-only">
								Please enter a valid email address
							</span>
						</div>
					</div>

					<div className="space-y-2">
						<div className="flex justify-between items-center">
							<Label htmlFor="password" id="password-label">
								Password
							</Label>
							<Link
								className="text-sm text-primary hover:underline"
								href="/forgot-password"
							>
								Forgot your password?
							</Link>
						</div>
						<div className="space-y-1">
							<Input
								id="password"
								type="password"
								name="password"
								placeholder="Your password"
								required
								aria-labelledby="password-label"
								aria-describedby={`${isPasswordInvalid ? 'password-error' : 'password-description'}`}
								aria-invalid={isPasswordInvalid}
								onChange={handleValidation}
							/>
							<span id="password-description" className="sr-only">
								Enter your account password
							</span>
							<span id="password-error" className="sr-only">
								Password must be at least 6 characters long
							</span>
						</div>
					</div>

					<Button className="w-full" type="submit">
						Log In
					</Button>
				</form>
			</AuthForm>
		</AuthLayout>
	)
}
