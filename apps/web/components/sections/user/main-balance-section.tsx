'use client'

import { Download, Send, Wallet } from 'lucide-react'
import { Button } from '~/components/base/button'
import { Card } from '~/components/base/card'
import { useGlowEffect } from '~/hooks/use-glow-effect'

export default function MainBalanceCard() {
	const cardRef = useGlowEffect()

	return (
		<Card ref={cardRef} className="p-6 max-w-sm glow-card">
			<div className="space-y-6">
				<div className="flex justify-between items-start">
					<div className="space-y-2">
						<p className="text-sm text-muted-foreground">Main Balance</p>
						<h2 className="text-3xl font-semibold tracking-tight">$2,458.20</h2>
					</div>
					<Wallet className="h-5 w-5 text-sky-800" />
				</div>

				<div className="grid grid-cols-2 gap-4">
					<Button
						className="w-full gradient-btn text-white z-10"
						aria-label="Send Money"
					>
						<Send className="mr-2 h-4 w-4" />
						Send
					</Button>
					<Button
						variant="outline"
						aria-label="Receive Money"
						className="w-full gradient-border-btn z-10"
					>
						<span className="w-full flex items-center justify-center">
							<Download className="mr-2 h-4 w-4" />
							Receive
						</span>
					</Button>
				</div>
			</div>
		</Card>
	)
}
