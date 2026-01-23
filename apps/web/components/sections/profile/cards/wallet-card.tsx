'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Copy, Link2, Wallet } from 'lucide-react'
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
}

export function WalletCard({
	smartAccountAddress,
	externalWalletAddress,
	isExternalConnected,
	onConnectExternal,
}: WalletCardProps) {
	const [copiedSmartAccount, setCopiedSmartAccount] = useState(false)
	const [copiedExternal, setCopiedExternal] = useState(false)

	const handleCopySmartAccount = async () => {
		if (!smartAccountAddress) return
		try {
			await navigator.clipboard.writeText(smartAccountAddress)
			setCopiedSmartAccount(true)
			toast.success('Smart Account address copied!')
			setTimeout(() => setCopiedSmartAccount(false), 2000)
		} catch (error) {
			console.error('Failed to copy address:', error)
			toast.error('Failed to copy address')
		}
	}

	const handleCopyExternal = async () => {
		if (!externalWalletAddress) return
		try {
			await navigator.clipboard.writeText(externalWalletAddress)
			setCopiedExternal(true)
			toast.success('External wallet address copied!')
			setTimeout(() => setCopiedExternal(false), 2000)
		} catch (error) {
			console.error('Failed to copy address:', error)
			toast.error('Failed to copy address')
		}
	}

	const displaySmartAccount = smartAccountAddress
		? `${smartAccountAddress.slice(0, 10)}...${smartAccountAddress.slice(-10)}`
		: null

	const displayExternalWallet = externalWalletAddress
		? `${externalWalletAddress.slice(0, 10)}...${externalWalletAddress.slice(-10)}`
		: null

	return (
		<motion.div
			whileHover={{ y: -4 }}
			transition={{ type: 'spring', stiffness: 400, damping: 25 }}
			className="h-full"
		>
			<Card className="h-full border-0 overflow-hidden bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col">
				{/* Top gradient bar */}
				<div className="h-2 bg-gradient-to-r from-[#000124] to-[#000124]/70" />

				<CardHeader className="pb-5 pt-6 flex-shrink-0">
					<div className="flex items-center justify-between">
						<CardTitle className="text-xl font-bold flex items-center gap-3 text-gray-800">
							<div className="p-2.5 rounded-lg bg-[#000124]/10 text-[#000124]">
								<Wallet className="h-5 w-5" />
							</div>
							<span>Wallets</span>
						</CardTitle>
					</div>
				</CardHeader>
				<CardContent className="space-y-5 flex flex-col flex-1 min-h-0">
					{/* Smart Account Section */}
					{smartAccountAddress ? (
						<div className="space-y-3 flex-1 flex flex-col">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Wallet className="h-4 w-4 text-[#000124]" />
									<span className="text-sm font-semibold text-foreground">
										Your Smart Account
									</span>
								</div>
								<Badge
									variant="outline"
									className="bg-[#000124]/10 text-[#000124] border-[#000124]/30 text-xs font-semibold"
								>
									Primary
								</Badge>
							</div>
							<p className="text-xs text-muted-foreground leading-relaxed">
								This is your secure smart wallet created when you signed up. Use
								it to receive funds and make transactions.
							</p>
							<div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
								<code className="text-sm font-mono text-foreground font-semibold tracking-wide">
									{displaySmartAccount}
								</code>
								<motion.div
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.9 }}
								>
									<Button
										variant="ghost"
										size="sm"
										onClick={handleCopySmartAccount}
										className="h-9 w-9 p-0 rounded-lg text-[#000124] hover:text-[#000124] hover:bg-[#000124]/10 transition-colors"
									>
										{copiedSmartAccount ? (
											<CheckCircle2 className="h-4 w-4" />
										) : (
											<Copy className="h-4 w-4" />
										)}
									</Button>
								</motion.div>
							</div>
							<Button
								variant="outline"
								size="sm"
								className="w-full border-gray-300 hover:bg-gray-50 hover:border-[#000124]/30 transition-all"
								onClick={handleCopySmartAccount}
							>
								<Copy className="h-3.5 w-3.5 mr-2" />
								Copy Full Address
							</Button>
						</div>
					) : (
						<div className="p-5 bg-gray-50 rounded-xl border border-gray-200 flex-1 flex items-center justify-center min-h-[200px]">
							<p className="text-sm text-muted-foreground text-center font-medium">
								Smart Account will be created when you complete registration
							</p>
						</div>
					)}

					{/* Divider */}
					{smartAccountAddress && (
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-border/50" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-card/80 px-2 text-muted-foreground">
									Optional
								</span>
							</div>
						</div>
					)}

					{/* External Wallet Section */}
					<div className="space-y-3 mt-auto">
						<div className="flex items-center gap-2">
							<Link2 className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm font-semibold text-foreground">
								External Wallet
							</span>
						</div>
						<p className="text-xs text-muted-foreground leading-relaxed">
							Connect an additional Stellar wallet (like Freighter or Albedo) if
							you want to use it alongside your smart account.
						</p>
						{isExternalConnected && externalWalletAddress ? (
							<>
								<div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
									<code className="text-sm font-mono text-foreground font-semibold tracking-wide">
										{displayExternalWallet}
									</code>
									<motion.div
										whileHover={{ scale: 1.1 }}
										whileTap={{ scale: 0.9 }}
									>
										<Button
											variant="ghost"
											size="sm"
											onClick={handleCopyExternal}
											className="h-9 w-9 p-0 rounded-lg text-[#000124] hover:text-[#000124] hover:bg-[#000124]/10 transition-colors"
										>
											{copiedExternal ? (
												<CheckCircle2 className="h-4 w-4" />
											) : (
												<Copy className="h-4 w-4" />
											)}
										</Button>
									</motion.div>
								</div>
								<Button
									variant="outline"
									size="sm"
									className="w-full border-gray-300 hover:bg-gray-50 hover:border-[#000124]/30 transition-all"
									onClick={handleCopyExternal}
								>
									<Copy className="h-3.5 w-3.5 mr-2" />
									Copy Full Address
								</Button>
							</>
						) : (
							<motion.div
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
							>
								<Button
									onClick={onConnectExternal}
									variant="outline"
									className="w-full border-gray-300 hover:bg-gray-50 hover:border-[#000124]/30 transition-all font-medium"
									size="sm"
								>
									<Link2 className="h-4 w-4 mr-2" />
									Connect External Wallet
								</Button>
							</motion.div>
						)}
					</div>
				</CardContent>
			</Card>
		</motion.div>
	)
}
