'use client'

import type { GetEscrowsFromIndexerResponse } from '@trustless-work/escrow'
import { Shield, Users, Wallet, Send } from 'lucide-react'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { Label } from '~/components/base/label'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '~/components/base/tooltip'

interface RolesCardProps {
	escrowData: GetEscrowsFromIndexerResponse
}

export function RolesCard({ escrowData }: RolesCardProps) {
	if (!escrowData.roles) return null

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Users className="w-5 h-5" />
					Roles & Permissions
				</CardTitle>
				<CardDescription>
					Addresses assigned to different roles in this escrow
				</CardDescription>
			</CardHeader>
			<CardContent>
				<TooltipProvider>
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Tooltip>
								<TooltipTrigger asChild>
									<Label className="text-xs text-muted-foreground cursor-help flex items-center gap-1">
										<Shield className="w-3 h-3" />
										Approver
									</Label>
								</TooltipTrigger>
								<TooltipContent className="max-w-xs">
									<p>
										Address of the entity requiring the service. Can approve
										milestones.
									</p>
								</TooltipContent>
							</Tooltip>
							<p className="font-mono text-sm break-all">
								{escrowData.roles.approver}
							</p>
						</div>
						<div className="space-y-2">
							<Tooltip>
								<TooltipTrigger asChild>
									<Label className="text-xs text-muted-foreground cursor-help flex items-center gap-1">
										<Users className="w-3 h-3" />
										Service Provider
									</Label>
								</TooltipTrigger>
								<TooltipContent className="max-w-xs">
									<p>
										Address of the entity providing the service. Can update
										milestone status.
									</p>
								</TooltipContent>
							</Tooltip>
							<p className="font-mono text-sm break-all">
								{escrowData.roles.serviceProvider}
							</p>
						</div>
						<div className="space-y-2">
							<Tooltip>
								<TooltipTrigger asChild>
									<Label className="text-xs text-muted-foreground cursor-help flex items-center gap-1">
										<Wallet className="w-3 h-3" />
										Platform Address
									</Label>
								</TooltipTrigger>
								<TooltipContent className="max-w-xs">
									<p>
										Address of the entity that owns the escrow platform.
									</p>
								</TooltipContent>
							</Tooltip>
							<p className="font-mono text-sm break-all">
								{escrowData.roles.platformAddress}
							</p>
						</div>
						<div className="space-y-2">
							<Tooltip>
								<TooltipTrigger asChild>
									<Label className="text-xs text-muted-foreground cursor-help flex items-center gap-1">
										<Send className="w-3 h-3" />
										Release Signer
									</Label>
								</TooltipTrigger>
								<TooltipContent className="max-w-xs">
									<p>
										Address in charge of releasing escrow funds to the service
										provider.
									</p>
								</TooltipContent>
							</Tooltip>
							<p className="font-mono text-sm break-all">
								{escrowData.roles.releaseSigner}
							</p>
						</div>
						<div className="space-y-2">
							<Tooltip>
								<TooltipTrigger asChild>
									<Label className="text-xs text-muted-foreground cursor-help flex items-center gap-1">
										<Shield className="w-3 h-3" />
										Dispute Resolver
									</Label>
								</TooltipTrigger>
								<TooltipContent className="max-w-xs">
									<p>
										Address in charge of resolving disputes within the escrow.
									</p>
								</TooltipContent>
							</Tooltip>
							<p className="font-mono text-sm break-all">
								{escrowData.roles.disputeResolver}
							</p>
						</div>
						{'receiver' in escrowData.roles && (
							<div className="space-y-2">
								<Tooltip>
									<TooltipTrigger asChild>
										<Label className="text-xs text-muted-foreground cursor-help flex items-center gap-1">
											<Wallet className="w-3 h-3" />
											Receiver
										</Label>
									</TooltipTrigger>
									<TooltipContent className="max-w-xs">
										<p>
											Address where escrow funds will be sent (for
											single-release escrows).
										</p>
									</TooltipContent>
								</Tooltip>
								<p className="font-mono text-sm break-all">
									{escrowData.roles.receiver}
								</p>
							</div>
						)}
					</div>
				</TooltipProvider>
			</CardContent>
		</Card>
	)
}

