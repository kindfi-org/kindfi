'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { Input } from '~/components/base/input'
import { Label } from '~/components/base/label'
import { useWebAuthnSupport } from '~/hooks/passkey/use-web-authn-support'
import { useNextAuth } from '~/hooks/use-next-auth'

interface SetupPasskeyFormProps {
	email: string
	onComplete?: () => void
}

export function SetupPasskeyForm({ email, onComplete }: SetupPasskeyFormProps) {
	const router = useRouter()
	const { registerPasskey } = useNextAuth()
	const isPasskeySupported = useWebAuthnSupport()
	const [deviceName, setDeviceName] = useState('My Primary Device')
	const [isRegistering, setIsRegistering] = useState(false)
	const [isComplete, setIsComplete] = useState(false)

	const handleSetupPasskey = async () => {
		if (!email) return

		try {
			setIsRegistering(true)
			await registerPasskey(email, deviceName)
			setIsComplete(true)
			onComplete?.()
		} catch (error) {
			console.error('Failed to register passkey:', error)
		} finally {
			setIsRegistering(false)
		}
	}

	if (!isPasskeySupported) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Device Not Supported</CardTitle>
					<CardDescription>
						Your device or browser doesn't support passkeys.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						You can continue using email verification codes for authentication
						and account recovery.
					</p>
				</CardContent>
				<CardFooter>
					<Button className="w-full" onClick={() => router.push('/account')}>
						Go to Account
					</Button>
				</CardFooter>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					{isComplete ? 'Passkey Setup Complete' : 'Set Up Passkey'}
				</CardTitle>
				<CardDescription>
					{isComplete
						? 'Your device is now registered for passwordless sign-in.'
						: 'Passkeys provide a more secure and convenient way to sign in.'}
				</CardDescription>
			</CardHeader>

			{isComplete ? (
				<CardContent>
					<p className="text-sm text-muted-foreground mb-4">
						You can now sign in to your account using this device without a
						password.
					</p>
				</CardContent>
			) : (
				<CardContent>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="deviceName">Device Name</Label>
							<Input
								id="deviceName"
								value={deviceName}
								onChange={(e) => setDeviceName(e.target.value)}
								disabled={isRegistering}
							/>
							<p className="text-xs text-muted-foreground">
								This name will help you identify this device in your account
								settings.
							</p>
						</div>
					</div>
				</CardContent>
			)}

			<CardFooter>
				{isComplete ? (
					<Button className="w-full" onClick={() => router.push('/account')}>
						Go to Account
					</Button>
				) : (
					<Button
						className="w-full"
						onClick={handleSetupPasskey}
						disabled={isRegistering}
					>
						{isRegistering ? 'Setting up...' : 'Register Passkey'}
					</Button>
				)}
			</CardFooter>
		</Card>
	)
}
