'use client'

import { CheckCircle2, Copy, Link2, LogOut, Wallet } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'

interface WalletCardProps {
	smartAccountAddress: string | null
	externalWalletAddress: string | null
	isExternalConnected: boolean
	onConnectExternal: () => Promise<void>
	onDisconnectExternal?: () => void
}

const truncateAddress = (address: string) =>
	`${address.slice(0, 8)}...${address.slice(-8)}`

export function WalletCard({
	smartAccountAddress,
	externalWalletAddress,
	isExternalConnected,
	onConnectExternal,
	onDisconnectExternal,
}: WalletCardProps) {
	const [copiedSmartAccount, setCopiedSmartAccount] = useState(false)
	const [copiedExternal, setCopiedExternal] = useState(false)

	const handleCopy = async (address: string, type: 'smart' | 'external') => {
		try {
			await navigator.clipboard.writeText(address)
			if (type === 'smart') {
				setCopiedSmartAccount(true)
				setTimeout(() => setCopiedSmartAccount(false), 2000)
			} else {
				setCopiedExternal(true)
				setTimeout(() => setCopiedExternal(false), 2000)
			}
			toast.success('Address copied!')
		} catch {
			toast.error('Failed to copy address')
		}
	}

	return (
		<Card className="h-full flex flex-col">
			<CardHeader className="pb-4">
				<CardTitle className="text-base font-semibold flex items-center gap-2">
					<Wallet className="h-4 w-4 text-primary" />
					Wallets
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4 flex flex-col flex-1 min-h-0">
				{/* Smart Account */}
				{smartAccountAddress ? (
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium">Smart Account</span>
							<Badge variant="secondary" className="text-xs">
								Primary
							</Badge>
						</div>
						<p className="text-xs text-muted-foreground">
							Your secure smart wallet for receiving funds and transactions.
						</p>
						<AddressRow
							address={smartAccountAddress}
							isCopied={copiedSmartAccount}
							onCopy={() => handleCopy(smartAccountAddress, 'smart')}
						/>
					</div>
				) : (
					<div className="p-4 bg-muted/50 rounded-lg text-center">
						<p className="text-sm text-muted-foreground">
							Smart Account will be created when you complete registration
						</p>
					</div>
				)}

				{/* Divider */}
				{smartAccountAddress && (
					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-border" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-card px-2 text-muted-foreground">
								Optional
							</span>
						</div>
					</div>
				)}

				{/* External Wallet */}
				<div className="space-y-2 mt-auto">
					<div className="flex items-center gap-2">
						<Link2 className="h-4 w-4 text-muted-foreground" />
						<span className="text-sm font-medium">External Wallet</span>
					</div>
					<p className="text-xs text-muted-foreground">
						Connect an additional Stellar wallet (like Freighter or Albedo).
					</p>
					{isExternalConnected && externalWalletAddress ? (
						<>
							<AddressRow
								address={externalWalletAddress}
								isCopied={copiedExternal}
								onCopy={() => handleCopy(externalWalletAddress, 'external')}
							/>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									className="flex-1"
									onClick={() => handleCopy(externalWalletAddress, 'external')}
								>
									<Copy className="h-3.5 w-3.5 mr-2" />
									Copy Address
								</Button>
								{onDisconnectExternal && (
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											onDisconnectExternal()
											toast.success('External wallet disconnected')
										}}
										className="text-destructive hover:bg-destructive/10 hover:text-destructive"
									>
										<LogOut className="h-3.5 w-3.5 mr-2" />
										Disconnect
									</Button>
								)}
							</div>
						</>
					) : (
						<Button
							onClick={onConnectExternal}
							variant="outline"
							className="w-full"
							size="sm"
						>
							<Link2 className="h-4 w-4 mr-2" />
							Connect External Wallet
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	)
}

function AddressRow({
	address,
	isCopied,
	onCopy,
}: {
	address: string
	isCopied: boolean
	onCopy: () => void
}) {
	return (
		<div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
			<code className="text-sm font-mono text-foreground tracking-wide">
				{truncateAddress(address)}
			</code>
			<Button
				variant="ghost"
				size="sm"
				onClick={onCopy}
				className="h-8 w-8 p-0"
			>
				{isCopied ? (
					<CheckCircle2 className="h-4 w-4 text-primary" />
				) : (
					<Copy className="h-4 w-4" />
				)}
			</Button>
		</div>
	)
}
