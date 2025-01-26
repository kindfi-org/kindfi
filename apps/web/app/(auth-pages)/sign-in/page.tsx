import Link from 'next/link'
import { signInAction } from '~/app/actions'
import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import { Label } from '~/components/base/label'
import type { Message } from '~/components/form-message'
import { AuthForm } from '~/components/shared/layout/auth/auth-form'
import { AuthLayout } from '~/components/shared/layout/auth/auth-layout'

export default async function Login(props: { searchParams: Promise<Message> }) {
	const searchParams = await props.searchParams

	return (
		<AuthLayout>
			<AuthForm
				title="Welcome Back"
				subtitle={
					<div className="text-sm text-muted-foreground">
						Don’t have an account?{' '}
						<Link
							className="text-primary font-medium hover:underline"
							href="/sign-up"
						>
							Sign Up
						</Link>
					</div>
				}
			>
				<form className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							name="email"
							type="email"
							placeholder="you@example.com"
							required
						/>
					</div>

					<div className="space-y-2">
						<div className="flex justify-between items-center">
							<Label htmlFor="password">Password</Label>
							<Link
								className="text-sm text-primary hover:underline"
								href="/forgot-password"
							>
								Forgot your password?
							</Link>
						</div>
						<Input
							id="password"
							type="password"
							name="password"
							placeholder="Your password"
							required
						/>
					</div>

					<Button
						className="w-full"
						formAction={signInAction}
						aria-label="Log Into Account"
					>
						Log In
					</Button>
				</form>
			</AuthForm>
		</AuthLayout>
	)
}
