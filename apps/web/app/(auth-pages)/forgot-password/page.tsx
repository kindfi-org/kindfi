'use client'

import Link from 'next/link'
import { forgotPasswordAction } from '~/app/actions'
import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import { Label } from '~/components/base/label'
import { FormMessage, type Message } from '~/components/form-message'
import { AuthForm } from '~/components/shared/layout/auth/auth-form'
import { AuthLayout } from '~/components/shared/layout/auth/auth-layout'

export async function ForgotPassword(props: {
	searchParams: Promise<Message>
}) {
	const searchParams = await props.searchParams

	return (
		<AuthLayout>
			<AuthForm
				title="Forgot Your Password?"
				subtitle="Enter your email address and we’ll send you a link to reset it."
				footerContent={
					<div>
						Remembered your password?{' '}
						<Link
							href="/sign-in"
							className="text-primary font-medium hover:underline"
						>
							Go back to login
						</Link>
					</div>
				}
			>
				<form className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							name="email"
							placeholder="you@example.com"
							required
						/>
					</div>

					<Button className="w-full" formAction={forgotPasswordAction}>
						Send Recovery Link
					</Button>

					{searchParams && <FormMessage message={searchParams} />}
				</form>
			</AuthForm>
		</AuthLayout>
	)
}
