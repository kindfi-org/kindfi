import Link from 'next/link'
import { signOutAction } from '~/app/actions'
import { validateEnvVars } from '~/lib/supabase/check-env-vars'
import { createClient } from '~/lib/supabase/server'
import { Badge } from './base/badge'
import { Button } from './base/button'

export async function AuthButton() {
	const supabase = await createClient()

	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!validateEnvVars) {
		return (
			<>
				<div className="flex gap-4 items-center">
					<div>
						<Badge
							variant={'default'}
							className="font-normal pointer-events-none"
						>
							Please update .env.local file with anon key and url
						</Badge>
					</div>
					<div className="flex gap-2">
						<Button
							asChild
							size="sm"
							variant={'outline'}
							disabled
							className="opacity-75 cursor-none pointer-events-none"
						>
							<Link href="/sign-in">Sign in</Link>
						</Button>
						<Button
							asChild
							size="sm"
							variant={'default'}
							disabled
							className="opacity-75 cursor-none pointer-events-none"
						>
							<Link href="/sign-up">Sign up</Link>
						</Button>
					</div>
				</div>
			</>
		)
	}
	return user ? (
		<div className="flex items-center gap-4">
			Hey, {user.email}!
			<form action={signOutAction}>
				<Button type="submit" variant={'outline'}>
					Sign out
				</Button>
			</form>
		</div>
	) : (
		<div className="flex gap-2">
			<Button asChild size="sm" variant={'outline'}>
				<Link href="/sign-in" aria-label="Sign In Page">
					Sign in
				</Link>
			</Button>
			<Button asChild size="sm" variant={'default'}>
				<Link href="/sign-up" aria-label="Sign Up Page">
					Sign up
				</Link>
			</Button>
		</div>
	)
}
