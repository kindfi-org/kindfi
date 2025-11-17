'use client'

import type { GetEscrowsFromIndexerResponse } from '@trustless-work/escrow'
import { Calendar, CheckCircle2, Copy, Send, XCircle, AlertCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { Label } from '~/components/base/label'
import { Separator } from '~/components/base/separator'
import { formatEscrowAmount } from '~/lib/utils/escrow/milestone-utils'
import { getStellarExplorerUrl } from '~/lib/utils/escrow/stellar-explorer'

interface EscrowDetailsCardProps {
	escrowData: GetEscrowsFromIndexerResponse
	escrowContractAddress: string
}

export function EscrowDetailsCard({
	escrowData,
	escrowContractAddress,
}: EscrowDetailsCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Escrow Details</CardTitle>
				<CardDescription>
					Complete information about your escrow contract
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="grid gap-6 sm:grid-cols-2">
					<div className="space-y-1">
						<Label className="text-xs text-muted-foreground">Title</Label>
						<p className="font-semibold">{escrowData.title}</p>
					</div>
					<div className="space-y-1">
						<Label className="text-xs text-muted-foreground">Status</Label>
						<div className="flex items-center gap-2 flex-wrap">
							<Badge
								variant={escrowData.isActive ? 'default' : 'secondary'}
								className="gap-1"
							>
								{escrowData.isActive ? (
									<>
										<CheckCircle2 className="w-3 h-3" />
										Active
									</>
								) : (
									<>
										<XCircle className="w-3 h-3" />
										Inactive
									</>
								)}
							</Badge>
							{escrowData.flags?.disputed && (
								<Badge variant="destructive" className="gap-1">
									<AlertCircle className="w-3 h-3" />
									Disputed
								</Badge>
							)}
							{escrowData.flags?.released && (
								<Badge variant="outline" className="gap-1">
									<Send className="w-3 h-3" />
									Released
								</Badge>
							)}
							{escrowData.flags?.resolved && (
								<Badge variant="default" className="gap-1">
									<CheckCircle2 className="w-3 h-3" />
									Resolved
								</Badge>
							)}
						</div>
					</div>
					<div className="space-y-1">
						<Label className="text-xs text-muted-foreground">
							Contract ID
						</Label>
						<div className="flex items-center gap-2">
							<p className="font-mono text-sm break-all">
								{escrowData.contractId || escrowContractAddress}
							</p>
							<div className="flex items-center gap-1">
								<Button
									variant="ghost"
									size="sm"
									className="h-6 w-6 p-0"
									onClick={() => {
										navigator.clipboard.writeText(
											escrowData.contractId || escrowContractAddress,
										)
										toast.success('Contract ID copied to clipboard')
									}}
									title="Copy Contract ID"
								>
									<Copy className="w-3 h-3" />
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="h-6 w-6 p-0"
									asChild
									title="View on Stellar Explorer"
								>
									<Link
										href={getStellarExplorerUrl(
											escrowData.contractId || escrowContractAddress,
										)}
										target="_blank"
										rel="noopener noreferrer"
									>
										<ExternalLink className="w-3 h-3" />
									</Link>
								</Button>
							</div>
						</div>
					</div>
					<div className="space-y-1">
						<Label className="text-xs text-muted-foreground">
							Engagement ID
						</Label>
						<p className="font-mono text-sm break-all">
							{escrowData.engagementId}
						</p>
					</div>
					<div className="space-y-1">
						<Label className="text-xs text-muted-foreground">
							Total Amount
						</Label>
						<p className="font-semibold text-lg">
							{escrowData.amount !== undefined &&
							escrowData.amount !== null &&
							typeof escrowData.amount === 'number'
								? formatEscrowAmount(escrowData.amount)
								: 'N/A'}
						</p>
						{escrowData.amount === undefined && escrowData.milestones && escrowData.milestones.length > 0 && (
							<p className="text-xs text-muted-foreground mt-1">
								Multi-release: Amounts are per milestone
							</p>
						)}
					</div>
					<div className="space-y-1">
						<Label className="text-xs text-muted-foreground">
							Platform Fee
						</Label>
						<p className="font-semibold">
							{escrowData.platformFee !== undefined &&
							escrowData.platformFee !== null &&
							typeof escrowData.platformFee === 'number'
								? `${escrowData.platformFee}%`
								: 'N/A'}
						</p>
					</div>
					{escrowData.signer && (
						<div className="space-y-1">
							<Label className="text-xs text-muted-foreground">Signer</Label>
							<p className="font-mono text-sm break-all">
								{escrowData.signer}
							</p>
						</div>
					)}
					{escrowData.user && (
						<div className="space-y-1">
							<Label className="text-xs text-muted-foreground">User</Label>
							<p className="font-mono text-sm break-all">
								{escrowData.user}
							</p>
						</div>
					)}
				</div>
				<Separator />
				<div className="space-y-1">
					<Label className="text-xs text-muted-foreground">Description</Label>
					<p className="text-sm leading-relaxed whitespace-pre-wrap">
						{escrowData.description}
					</p>
				</div>
				{(escrowData.createdAt || escrowData.updatedAt) && (
					<>
						<Separator />
						<div className="grid gap-6 sm:grid-cols-2">
							{escrowData.createdAt && (
								<div className="space-y-1">
									<Label className="text-xs text-muted-foreground flex items-center gap-1">
										<Calendar className="w-3 h-3" />
										Created At
									</Label>
									<p className="text-sm">
										{typeof escrowData.createdAt === 'string' ||
										typeof escrowData.createdAt === 'number'
											? new Date(escrowData.createdAt).toLocaleString()
											: escrowData.createdAt.toLocaleString()}
									</p>
								</div>
							)}
							{escrowData.updatedAt && (
								<div className="space-y-1">
									<Label className="text-xs text-muted-foreground flex items-center gap-1">
										<Calendar className="w-3 h-3" />
										Updated At
									</Label>
									<p className="text-sm">
										{typeof escrowData.updatedAt === 'string' ||
										typeof escrowData.updatedAt === 'number'
											? new Date(escrowData.updatedAt).toLocaleString()
											: escrowData.updatedAt.toLocaleString()}
									</p>
								</div>
							)}
						</div>
					</>
				)}
			</CardContent>
		</Card>
	)
}

