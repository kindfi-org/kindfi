import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function AuthErrorPage() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center p-4">
			<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
				<div className="flex flex-col space-y-2 text-center">
					<div className="mx-auto rounded-full bg-destructive/15 p-3">
						<AlertCircle className="h-6 w-6 text-destructive" />
					</div>
					<h1 className="text-2xl font-semibold tracking-tight">
						Authentication Error
					</h1>
					<p className="text-sm text-muted-foreground">
						There was a problem with authentication. Please try signing in
						again.
					</p>
				</div>

				<Link href="/login" className="w-full">
					Back to Login
				</Link>
			</div>
		</div>
	)
}
