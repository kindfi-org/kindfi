'use client'

import type { GetEscrowsFromIndexerResponse } from '@trustless-work/escrow'
import { DollarSign, Wallet } from 'lucide-react'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { Label } from '~/components/base/label'
import { formatEscrowAmount } from '~/lib/utils/escrow/milestone-utils'

interface TrustlineAndFundsCardProps {
	escrowData: GetEscrowsFromIndexerResponse
}

export function TrustlineAndFundsCard({
	escrowData,
}: TrustlineAndFundsCardProps) {
	return (
		<div className="grid gap-6 md:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Wallet className="w-5 h-5" />
						Trustline Information
					</CardTitle>
					<CardDescription>Token details for this escrow</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{escrowData.trustline && (
						<>
							<div className="space-y-1">
								<Label className="text-xs text-muted-foreground">
									Token Address
								</Label>
								<p className="font-mono text-sm break-all">
									{escrowData.trustline.address}
								</p>
							</div>
							{escrowData.trustline.name && (
								<div className="space-y-1">
									<Label className="text-xs text-muted-foreground">
										Token Name
									</Label>
									<p className="font-semibold">{escrowData.trustline.name}</p>
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>

			{(escrowData.approverFunds ||
				escrowData.receiverFunds ||
				escrowData.balance !== undefined) && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<DollarSign className="w-5 h-5" />
							Funds Breakdown
						</CardTitle>
						<CardDescription>
							Current balance and fund allocations
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{escrowData.balance !== undefined &&
							escrowData.balance !== null && (
								<div className="space-y-1">
									<Label className="text-xs text-muted-foreground">
										Current Balance
									</Label>
									<p className="font-semibold text-lg">
										{formatEscrowAmount(escrowData.balance)}
									</p>
								</div>
							)}
						{escrowData.approverFunds && (
							<div className="space-y-1">
								<Label className="text-xs text-muted-foreground">
									Approver Funds
								</Label>
								<p className="font-semibold">
									{formatEscrowAmount(Number(escrowData.approverFunds))}
								</p>
							</div>
						)}
						{escrowData.receiverFunds && (
							<div className="space-y-1">
								<Label className="text-xs text-muted-foreground">
									Receiver Funds
								</Label>
								<p className="font-semibold">
									{formatEscrowAmount(Number(escrowData.receiverFunds))}
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	)
}
