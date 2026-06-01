import Link from 'next/link'
import { requestResetAccountAction } from '~/app/actions/auth'
import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import { FormMessage, type Message } from '~/components/form-message'
import { FormFieldGroup } from '~/components/shared/form/form-field-group'
import { FormShell } from '~/components/shared/form/form-shell'
import { AuthLayout } from '~/components/shared/layout/auth/auth-layout'
import { formLayoutClasses } from '~/lib/form/form-styles'

export async function ResetAccountComponent({ searchParams }: { searchParams: Message }) {
	return (
		<AuthLayout>
			<FormShell
				title="Forgot Your Password?"
				subtitle="Enter your email address and we’ll send you a link to reset it."
				footer={
					<div className="w-full text-center text-sm text-muted-foreground">
						Remembered your password?{' '}
						<Link href="/sign-in" className="font-medium text-primary hover:underline">
							Go back to login
						</Link>
					</div>
				}
			>
				<form className={formLayoutClasses.stack}>
					<FormFieldGroup id="email" label="Email" required>
						<Input
							id="email"
							type="email"
							name="email"
							placeholder="you@example.com"
							required
							autoComplete="email"
						/>
					</FormFieldGroup>

					<Button className="gradient-btn w-full text-white" formAction={requestResetAccountAction}>
						Send Recovery Link
					</Button>

					{searchParams ? <FormMessage message={searchParams} /> : null}
				</form>
			</FormShell>
		</AuthLayout>
	)
}
