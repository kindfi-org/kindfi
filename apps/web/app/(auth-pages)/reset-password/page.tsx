import Link from 'next/link'
import { resetPasswordAction } from '~/app/actions'
import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import { Label } from '~/components/base/label'
import { FormMessage, type Message } from '~/components/form-message'
import { AuthForm } from '~/components/shared/layout/auth/auth-form'
import { AuthLayout } from '~/components/shared/layout/auth/auth-layout'

export default async function ResetPassword(props: {
	searchParams: Promise<Message>
}) {
	const searchParams = await props.searchParams

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

					<Button
						className="w-full"
						formAction={resetPasswordAction}
						aria-label="Update Account Password"
					>
						Update Password
					</Button>

					{searchParams && <FormMessage message={searchParams} />}
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
