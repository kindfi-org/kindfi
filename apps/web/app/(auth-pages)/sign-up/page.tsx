'use client'

import { Lock, Mail, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { signUpAction } from '~/app/actions'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from '~/components/base/card'
import { Input } from '~/components/base/input'
import { Label } from '~/components/base/label'
import type { Message } from '~/components/form-message'
import { AuthLayout } from '~/components/shared/layout/auth/auth-layout'
import { useFormValidation } from '~/hooks/use-form-validation'
import { handleClientAuthError } from '~/lib/auth/clientauth-error-handler'
import { AuthResponse } from '~/lib/types/auth'

export default function Signup(props: { searchParams: Promise<Message> }) {
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
	}, [searchParams])

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		resetValidation()

		const formData = new FormData(event.currentTarget)
		try {
			const response = await signUpAction(formData)
			setAuthResponse(response)
			if (!response.success) {
				toast.error(response.message)
			} else {
				toast.success('Your account has been created successfully.')
				router.push(response.redirect || 'sign-in')
			}
		} catch (error: any) {
			const errorResponse = handleClientAuthError(error)
			setAuthResponse(errorResponse)
			toast.error(errorResponse.message)
		}
	}

	return (
		<AuthLayout>
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-2 text-center">
					<div className="flex justify-center mb-4">
						<div className="rounded-full bg-primary/10 p-4">
							<UserPlus className="h-6 w-6 text-primary" />
						</div>
					</div>
					<h1 className="text-2xl font-semibold tracking-tight">
						Create an account
					</h1>
					<p className="text-sm text-muted-foreground">
						Enter your email below to create your account
					</p>
				</CardHeader>
				<CardContent>
					<form
						className="space-y-4"
						aria-label="Sign up"
						onSubmit={handleSubmit}
					>
						<div className="space-y-4">
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
										aria-describedby={`${isEmailInvalid ? 'email-error' : 'email-description'}`}
										aria-invalid={isEmailInvalid}
										onChange={handleValidation}
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
								<div className="relative">
									<Lock
										className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
										aria-hidden="true"
									/>
									<Input
										id="password"
										name="password"
										type="password"
										placeholder="Create a password"
										className="pl-10"
										required
										minLength={6}
										aria-labelledby="password-label"
										aria-describedby={`${isPasswordInvalid ? 'password-requirements' : 'password-description'}`}
										aria-invalid={isPasswordInvalid}
										onChange={handleValidation}
									/>
									<span id="password-description" className="sr-only">
										Create a password for your account
									</span>
									<p
										id="password-requirements"
										className="text-xs text-muted-foreground mt-1"
									>
										Password must be at least 6 characters long
									</p>
								</div>
							</div>

							<Button className="w-full" type="submit">
								Create account
							</Button>
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