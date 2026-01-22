'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Copy, Wallet } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'

interface WalletCardProps {
	address: string | null
	isConnected: boolean
	onConnect: () => Promise<void>
}

export function WalletCard({
	address,
	isConnected,
	onConnect,
}: WalletCardProps) {
	const [copied, setCopied] = useState(false)

	const handleCopy = async () => {
		if (!address) return
		try {
			await navigator.clipboard.writeText(address)
			setCopied(true)
			toast.success('Wallet address copied!')
			setTimeout(() => setCopied(false), 2000)
		} catch (error) {
			console.error('Failed to copy address:', error)
			toast.error('Failed to copy address')
		}
	}

	const displayAddress = address
		? `${address.slice(0, 8)}...${address.slice(-8)}`
		: 'Not connected'

	return (
		<motion.div
			whileHover={{ y: -5 }}
			transition={{ type: 'spring', stiffness: 300 }}
		>
			<Card className="border-0 overflow-hidden bg-card shadow-lg hover:shadow-2xl transition-all duration-300 relative group">
				{/* Decorative shape */}
				<div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />

				<CardHeader className="pb-3 relative z-10">
					<div className="flex items-center justify-between">
						<CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
							<motion.div
								animate={{ rotate: [0, 360] }}
								transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
							>
								<Wallet className="h-5 w-5" />
							</motion.div>
							Wallet
						</CardTitle>
						{isConnected && (
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								className="relative"
							>
								<div className="h-3 w-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
								<div className="absolute inset-0 h-3 w-3 rounded-full bg-green-500 animate-ping" />
							</motion.div>
						)}
					</div>
				</CardHeader>
				<CardContent className="space-y-3 relative z-10">
					{isConnected && address ? (
						<>
							<div className="flex items-center justify-between p-3 bg-muted/50 backdrop-blur-sm rounded-xl border border-border">
								<code className="text-sm font-mono text-foreground">
									{displayAddress}
								</code>
								<motion.div
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.9 }}
								>
									<Button
										variant="ghost"
										size="sm"
										onClick={handleCopy}
										className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10"
									>
										{copied ? (
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
								className="w-full border-border hover:bg-muted"
								onClick={handleCopy}
							>
								<Copy className="h-3 w-3 mr-2" />
								Copy Full Address
							</Button>
						</>
					) : (
						<>
							<p className="text-sm text-muted-foreground">
								Connect your Stellar wallet to start contributing
							</p>
							<motion.div
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
							>
								<Button
									onClick={onConnect}
									className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
									size="sm"
								>
									<Wallet className="h-4 w-4 mr-2" />
									Connect Wallet
								</Button>
							</motion.div>
						</>
					)}
				</CardContent>
			</Card>
		</motion.div>
	)
}
