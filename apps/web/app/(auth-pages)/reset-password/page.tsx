'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { resetPasswordAction } from '~/app/actions/auth'
import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import { Label } from '~/components/base/label'
import { FormMessage, type Message } from '~/components/form-message'
import { AuthForm } from '~/components/shared/layout/auth/auth-form'
import { AuthLayout } from '~/components/shared/layout/auth/auth-layout'
import { logger } from '~/lib'

export default function ResetPassword(props: {
	searchParams: Promise<Message>
}) {
	const [message, setMessage] = useState<Message | null>(null)

	useEffect(() => {
		// Resolve the promise when component mounts
		const fetchMessage = async () => {
			try {
				const result = await props.searchParams
				setMessage(result)
			} catch (error) {
				logger.error({
					eventType: 'ResetPassword Page Error',
					error: (error as Error).message,
					stack: (error as Error).stack,
				})
			}
		}

		fetchMessage()
	}, [props.searchParams])

	return (
		<AuthLayout>
			<AuthForm
				title="Restablecer contraseña"
				subtitle="Por favor, ingresa tu nueva contraseña a continuación."
			>
				<form className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="password">New Password</Label>
						<Input
							id="password"
							type="password"
							name="password"
							placeholder="Ingresa tu nueva contraseña"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="confirmPassword">Repeat password</Label>
						<Input
							id="confirmPassword"
							type="password"
							name="confirmPassword"
							placeholder="Confirma tu nueva contraseña"
							required
						/>
					</div>

					<Button className="w-full" formAction={resetPasswordAction}>
						Update Password
					</Button>

					{message && <FormMessage message={message} />}
				</form>

				<div className="mt-4 text-center">
					<Link
						href="/sign-in"
						className="text-sm text-primary hover:underline"
					>
						Back to home
					</Link>
				</div>
			</AuthForm>
		</AuthLayout>
	)
}
