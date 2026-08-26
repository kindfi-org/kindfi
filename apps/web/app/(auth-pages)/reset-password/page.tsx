'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { logger } from '@/lib/logger'
import { resetPasswordAction } from '~/app/actions/auth/password-reset-actions'
import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import { FormMessage, type Message } from '~/components/form-message'
import { FormFieldGroup } from '~/components/shared/form/form-field-group'
import { FormShell } from '~/components/shared/form/form-shell'
import { AuthLayout } from '~/components/shared/layout/auth/auth-layout'
import { formLayoutClasses } from '~/lib/form/form-styles'

export default function ResetPassword(props: { searchParams: Promise<Message> }) {
	const [message, setMessage] = useState<Message | null>(null)

	useEffect(() => {
		const fetchMessage = async () => {
			try {
				const result = await props.searchParams
				setMessage(result)
			} catch (error) {
				logger.error('Error fetching message:', error)
			}
		}

		fetchMessage()
	}, [props.searchParams])

	return (
		<AuthLayout>
			<FormShell
				title="Reset password"
				subtitle="Enter your new password below."
				footer={
					<div className="w-full text-center text-sm text-muted-foreground">
						<Link href="/sign-in" className="font-medium text-primary hover:underline">
							Back to sign in
						</Link>
					</div>
				}
			>
				<form className={formLayoutClasses.stack}>
					<FormFieldGroup id="password" label="New password" required>
						<Input
							id="password"
							type="password"
							name="password"
							placeholder="Enter your new password"
							required
							autoComplete="new-password"
						/>
					</FormFieldGroup>

					<FormFieldGroup id="confirmPassword" label="Confirm password" required>
						<Input
							id="confirmPassword"
							type="password"
							name="confirmPassword"
							placeholder="Confirm your new password"
							required
							autoComplete="new-password"
						/>
					</FormFieldGroup>

					<Button className="gradient-btn w-full text-white" formAction={resetPasswordAction}>
						Update Password
					</Button>

					{message ? <FormMessage message={message} /> : null}
				</form>
			</FormShell>
		</AuthLayout>
	)
}
