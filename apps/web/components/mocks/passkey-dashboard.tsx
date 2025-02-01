'use client'

import * as Form from '@radix-ui/react-form'
import * as React from 'react'
import { MdContentCopy } from 'react-icons/md'
import { toast } from 'sonner'
import { usePasskeyAuthentication } from '~/hooks/passkey/use-passkey-authentication'
import { usePasskeyRegistration } from '~/hooks/passkey/use-passkey-registration'
import { useWebAuthnSupport } from '~/hooks/passkey/use-web-authn-support'
import { useStellarContext } from '~/hooks/stellar/stellar-context'
import { truncateAccount } from '~/lib/passkey/stellar'

// This component is a mock of the passkey dashboard
// It is used to test the passkey authentication and registration
// It is pre-used in the production environment

export const PasskeyDashboard = ({
	identifier = 'test',
}: {
	identifier?: string
}) => {
	const isWebAuthnSupported = useWebAuthnSupport()

	const {
		onRegister,
		onSign,
		deployee,
		loadingDeployee,
		prepareSign,
		contractData,
	} = useStellarContext()

	const {
		isCreatingPasskey,
		regSuccess,
		regError,
		handleRegister,
		reset: resetReg,
		isAlreadyRegistered,
	} = usePasskeyRegistration(identifier, { onRegister })

	const {
		isAuthenticating,
		authSuccess,
		authError,
		handleAuth,
		reset: resetAuth,
	} = usePasskeyAuthentication(identifier, { onSign, prepareSign })

	// State for action
	const [action, setAction] = React.useState<string | null>(null)

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		if (!action) {
			console.error('Action is undefined')
			return
		}

		toast(`Processing ${action}...`)

		if (action === 'register') {
			resetReg()
			resetAuth()
			handleRegister()
		} else if (action === 'verify') {
			resetAuth()
			resetReg()
			handleAuth()
		}
	}

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text).then(
			() => {
				toast('Copied to clipboard!')
			},
			(err) => {
				console.error('Could not copy text: ', err)
			},
		)
	}

	if (!isWebAuthnSupported) return <div>WebAuthn is not supported</div>

	return (
		<div className="bg-white shadow-lg rounded-lg p-8 max-w-xl mx-auto">
			<h2 className="text-2xl font-bold mb-6 text-indigo-800">
				Passkey Management
			</h2>
			<Form.Root onSubmit={handleSubmit}>
				<Form.Field name="username">
					<Form.Label className="text-sm font-medium text-gray-700 mb-1 block">
						Username
					</Form.Label>
					<Form.Control asChild>
						<input
							className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm shadow-sm placeholder-black text-black
                         focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-200"
							type="text"
							required
							value={identifier}
							readOnly
						/>
					</Form.Control>
					<Form.Message
						match="valueMissing"
						className="text-red-500 text-sm mt-1"
					>
						Please enter a username
					</Form.Message>
				</Form.Field>

				{deployee || loadingDeployee ? (
					<div className="mt-6 flex space-x-4 items-center">
						<p className="text-sm text-gray-500">
							{deployee
								? `Stellar Account: ${truncateAccount(deployee)}`
								: 'Checking Stellar Account...'}
						</p>
						{deployee && (
							<button
								type="button"
								className="text-sm text-blue-500 hover:underline flex items-center"
								onClick={() => copyToClipboard(deployee)}
							>
								<MdContentCopy className="mr-1" />
								Copy
							</button>
						)}
					</div>
				) : null}
				{!loadingDeployee && (
					<div className="mt-6 flex space-x-4">
						{!deployee ? (
							<Form.Submit asChild>
								<button
									className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
									type="submit"
									onClick={() => setAction('register')}
									disabled={isCreatingPasskey}
								>
									{isCreatingPasskey ? 'Registering...' : 'Register Passkey'}
								</button>
							</Form.Submit>
						) : null}
						<Form.Submit asChild>
							<button
								className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200"
								type="submit"
								onClick={() => setAction('verify')}
								disabled={isAuthenticating}
							>
								{isAuthenticating
									? 'Authenticating...'
									: !deployee
										? 'Verify Passkey'
										: 'Sign Transaction'}
							</button>
						</Form.Submit>
					</div>
				)}
			</Form.Root>
			{regSuccess && (
				<p className="mt-4 text-green-600 font-medium">{regSuccess}</p>
			)}
			{regError && <p className="mt-4 text-red-600 font-medium">{regError}</p>}
			{authSuccess && (
				<p className="mt-4 text-green-600 font-medium">{authSuccess}</p>
			)}
			{authError && (
				<p className="mt-4 text-red-600 font-medium">{authError}</p>
			)}
			{contractData && (
				<pre className="mt-4 text-green-600 font-medium">
					{JSON.stringify(contractData, null, 2)}
				</pre>
			)}
		</div>
	)
}
