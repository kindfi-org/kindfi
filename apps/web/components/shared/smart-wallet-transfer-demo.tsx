'use client'

import { appEnvConfig } from '@packages/lib/config'
import { useStellarSorobanAccount } from '@packages/lib/hooks'
import { startAuthentication } from '@simplewebauthn/browser'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { Input } from '~/components/base/input'
import { ErrorCode, InAppError } from '~/lib/passkey/errors'
import type { verifyAuthentication } from '../../../../packages/lib/src/passkey/passkey.service'

interface TransferFormData {
	to: string
	amount: string
	asset: 'native' | string
}

/**
 * Smart Wallet Transfer Demo
 *
 * Demonstrates transfer operations using the new smart wallet transaction API
 * Supports XLM and Stellar Asset transfers with WebAuthn signing
 */
export function SmartWalletTransferDemo() {
	const { data: session } = useSession()
	const [formData, setFormData] = useState<TransferFormData>({
		to: '',
		amount: '',
		asset: 'native',
	})
	const [isLoading, setIsLoading] = useState(false)
	const [isFunding, setIsFunding] = useState(false)
	const [isApproving, setIsApproving] = useState(false)
	const [balance, setBalance] = useState<string | null>(null)
	const [smartWalletAddress] = useState<string>(
		session?.device?.address || session?.user.device?.address || '',
	)

	/**
	 * Approve smart wallet in auth-controller
	 * Required before wallet can perform authenticated operations
	 */
	const approveAccount = async () => {
		try {
			setIsApproving(true)

			const response = await fetch('/api/stellar/account/approve', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					accountAddress: smartWalletAddress,
				}),
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.details || 'Failed to approve account')
			}

			const result = await response.json()

			toast.success('Account approved successfully!', {
				description: `Your smart wallet is now registered in the auth-controller`,
				duration: 5000,
			})

			console.log('Account approval tx:', result.data.hash)
		} catch (error) {
			console.error('Error approving account:', error)
			toast.error(
				error instanceof Error ? error.message : 'Failed to approve account',
			)
		} finally {
			setIsApproving(false)
		}
	}

	/**
	 * Fund smart wallet with testnet XLM
	 */
	const fundWallet = async (amount = '10') => {
		try {
			setIsFunding(true)

			const response = await fetch('/api/stellar/faucet', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					address: smartWalletAddress,
					amount,
				}),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.details || 'Failed to fund wallet')
			}

			const result = await response.json()

			toast.success(`Wallet funded successfully!`, {
				description: `Added ${result.data.amount} XLM to your wallet`,
				duration: 5000,
			})

			// Refresh balance after funding
			await fetchBalance()
		} catch (error) {
			console.error('Error funding wallet:', error)
			toast.error(
				error instanceof Error ? error.message : 'Failed to fund wallet',
			)
		} finally {
			setIsFunding(false)
		}
	}

	/**
	 * Fetch wallet balances
	 */
	const fetchBalance = async () => {
		try {
			setIsLoading(true)
			const response = await fetch(
				`/api/stellar/balances/${smartWalletAddress}`,
			)

			if (!response.ok) {
				throw new Error('Failed to fetch balance')
			}

			const data = await response.json()
			setBalance(data.data.xlm.balance)
			toast.success(`Balance: ${data.data.xlm.balance} XLM`)
		} catch (error) {
			console.error('Error fetching balance:', error)
			toast.error('Failed to fetch balance')
		} finally {
			setIsLoading(false)
		}
	}

	const smartWalletActions = useStellarSorobanAccount(session?.user)

	/**
	 * Prepare transfer transaction
	 */
	const prepareTransfer = async () => {
		try {
			setIsLoading(true)

			// Validate inputs
			if (!formData.to || !formData.amount) {
				toast.error('Please fill in all fields')
				return
			}

			// Convert XLM to stroops
			const amountInStroops = Math.floor(Number(formData.amount) * 10_000_000)

			// Prepare transaction
			const response = await fetch('/api/stellar/transfer/prepare', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					from: smartWalletAddress,
					to: formData.to,
					amount: amountInStroops,
					asset: formData.asset,
					sponsorFees: true, // Enable fee sponsorship for better UX
				}),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.details || 'Failed to prepare transfer')
			}

			const { data } = await response.json()

			toast.success('Transaction prepared successfully!')
			console.log('Transaction prepared:', data)

			// Implement WebAuthn signing
			const appConfig = appEnvConfig('web')
			const baseUrl = appConfig.externalApis.kyc.baseUrl

			// Get authentication options from KYC server
			const authOptionsResponse = await fetch(
				`${baseUrl}/api/passkey/generate-authentication-options`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						identifier: session?.user?.email,
						origin: window.location.origin,
						challenge: data.challenge,
					}),
				},
			)

			if (!authOptionsResponse.ok) {
				throw new Error('Failed to generate authentication options')
			}

			const authOptions = await authOptionsResponse.json()

			// Prompt user for WebAuthn authentication
			const authResponse = await startAuthentication({
				optionsJSON: authOptions,
			})

			const verificationResp = await fetch(
				`${baseUrl}/api/passkey/verify-authentication`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						identifier: session?.user?.email,
						authenticationResponse: authResponse,
						origin: window.location.origin,
						userId: session?.user?.id,
					}),
				},
			)

			if (!verificationResp.ok) {
				const verificationJSON = await verificationResp.json()
				throw new InAppError(ErrorCode.UNEXPECTED_ERROR, verificationJSON.error)
			}

			const verificationJSON = await (verificationResp.json() as ReturnType<
				typeof verifyAuthentication
			>)

			if (!verificationJSON?.verified) {
				throw new InAppError(
					ErrorCode.AUTHENTICATOR_NOT_REGISTERED,
					'Authentication verification failed',
				)
			}

			toast.info('Verifying signature...', {
				description: 'Please wait while we process your transaction',
			})

			console.log('📝 WebAuthn response:', {
				id: authResponse.id,
				type: authResponse.type,
				rawId: authResponse.rawId,
				authResponse,
			})

			// Submit the signed transaction
			const submitResponse = await fetch('/api/stellar/transfer/submit', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					transactionData: data,
					userDevice: session?.device || session?.user.device,
					verificationJSON,
					authResponse,
				}),
			})

			if (!submitResponse.ok) {
				const errorData = await submitResponse.json()
				throw new Error(errorData.details || 'Failed to submit transaction')
			}

			const submitResult = await submitResponse.json()

			toast.success('Transfer completed successfully!', {
				description: `Transaction hash: ${submitResult.hash}`,
				duration: 10000,
			})

			// Reset form
			setFormData({ to: '', amount: '', asset: 'native' })

			// Refresh balance
			await fetchBalance()
		} catch (error) {
			console.error('Error preparing transfer:', error)

			if (error instanceof Error) {
				if (error.message.includes('NotAllowedError')) {
					toast.error('Authentication cancelled', {
						description:
							'You need to approve the transaction with your passkey',
					})
				} else if (error.message.includes('timeout')) {
					toast.error('Authentication timeout', {
						description: 'Please try again',
					})
				} else {
					toast.error(error.message)
				}
			} else {
				toast.error('Failed to prepare transfer')
			}
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="space-y-6 max-w-2xl mx-auto p-6">
			<Card>
				<CardHeader>
					<CardTitle>Smart Wallet Transfer Demo</CardTitle>
					<CardDescription>
						Transfer XLM and Stellar Assets using WebAuthn authentication
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Wallet Info */}
					<div className="rounded-lg bg-muted p-4">
						<div className="text-sm font-medium mb-2">Your Smart Wallet</div>
						<div className="text-xs font-mono break-all text-muted-foreground">
							{smartWalletAddress}
						</div>
						<div className="mt-3 flex items-center gap-2 flex-wrap">
							<Button
								size="sm"
								variant="outline"
								onClick={approveAccount}
								disabled={isApproving}
							>
								{isApproving ? 'Approving...' : 'Approve Account'}
							</Button>
							<Button
								size="sm"
								variant="outline"
								onClick={fetchBalance}
								disabled={isLoading}
							>
								{isLoading ? 'Loading...' : 'Check Balance'}
							</Button>
							<Button
								size="sm"
								variant="secondary"
								onClick={() => fundWallet('10')}
								disabled={isFunding}
							>
								{isFunding ? 'Funding...' : '💰 Fund Wallet (10 XLM)'}
							</Button>
							{balance && (
								<span className="text-sm font-medium bg-green-50 dark:bg-green-950 px-3 py-1 rounded-md">
									{balance} XLM
								</span>
							)}
						</div>
					</div>

					{/* Transfer Form */}
					<div className="space-y-4">
						<div>
							<label htmlFor="to" className="block text-sm font-medium mb-2">
								Recipient Address
							</label>
							<Input
								id="to"
								type="text"
								placeholder="GBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
								value={formData.to}
								onChange={(e) =>
									setFormData({ ...formData, to: e.target.value })
								}
								className="font-mono text-sm"
							/>
						</div>

						<div>
							<label
								htmlFor="amount"
								className="block text-sm font-medium mb-2"
							>
								Amount (XLM)
							</label>
							<Input
								id="amount"
								type="number"
								step="0.0000001"
								placeholder="10.0"
								value={formData.amount}
								onChange={(e) =>
									setFormData({ ...formData, amount: e.target.value })
								}
							/>
						</div>

						<div>
							<label htmlFor="asset" className="block text-sm font-medium mb-2">
								Asset
							</label>
							<select
								id="asset"
								value={formData.asset}
								onChange={(e) =>
									setFormData({ ...formData, asset: e.target.value })
								}
								className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
							>
								<option value="native">XLM (Native)</option>
								<option value="CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA">
									USDC (Testnet)
								</option>
							</select>
						</div>

						<Button
							onClick={prepareTransfer}
							disabled={isLoading}
							className="w-full"
						>
							{isLoading ? 'Preparing...' : 'Prepare Transfer'}
						</Button>
					</div>

					{/* Faucet Info */}
					<div className="rounded-lg bg-amber-50 dark:bg-amber-950 p-4 text-sm">
						<div className="font-medium mb-1 flex items-center gap-2">
							💰 Testnet Faucet
						</div>
						<div className="text-muted-foreground">
							Your smart wallet needs XLM to pay for transactions. Use the "Fund
							Wallet" button to get testnet XLM for testing. This only works on
							Stellar Testnet.
						</div>
					</div>

					{/* Info Box */}
					<div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 text-sm">
						<div className="font-medium mb-1">🔐 WebAuthn Signing</div>
						<div className="text-muted-foreground">
							Transactions require biometric authentication (fingerprint/Face
							ID) for security. Fee sponsorship is enabled for better UX.
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Features Card */}
			<Card>
				<CardHeader>
					<CardTitle>Supported Operations</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<div className="font-medium">✅ Transfers</div>
							<ul className="text-sm text-muted-foreground space-y-1">
								<li>• Send XLM to any address</li>
								<li>• Send Stellar Assets (USDC, EURC)</li>
								<li>• Fee sponsorship available</li>
							</ul>
						</div>
						<div className="space-y-2">
							<div className="font-medium">✅ Receiving</div>
							<ul className="text-sm text-muted-foreground space-y-1">
								<li>• Receive from exchanges</li>
								<li>• Receive from onramp providers</li>
								<li>• Receive from other wallets</li>
							</ul>
						</div>
						<div className="space-y-2">
							<div className="font-medium">✅ Smart Contracts</div>
							<ul className="text-sm text-muted-foreground space-y-1">
								<li>• Invoke DeFi protocols</li>
								<li>• Mint NFTs</li>
								<li>• Custom contract calls</li>
							</ul>
						</div>
						<div className="space-y-2">
							<div className="font-medium">✅ Security</div>
							<ul className="text-sm text-muted-foreground space-y-1">
								<li>• WebAuthn authentication</li>
								<li>• On-chain verification</li>
								<li>• Multi-device support</li>
							</ul>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
