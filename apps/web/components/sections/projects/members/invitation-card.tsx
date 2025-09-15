'use client'

import { formatDistanceToNow, isAfter } from 'date-fns'
import { motion } from 'framer-motion'
import { Mail, MoreHorizontal, RefreshCw, X } from 'lucide-react'

import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { Card, CardContent } from '~/components/base/card'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '~/components/base/dropdown-menu'
import type { PendingInvitation } from '~/lib/types/project/team-members.types'
import { RoleBadge } from './role-badge'

interface InvitationCardProps {
	invitation: PendingInvitation
	index: number
	onResend?: (id: string) => void
	onCancel?: (id: string) => void
}

export function InvitationCard({
	invitation,
	index,
	onResend,
	onCancel,
}: InvitationCardProps) {
	const isExpired = isAfter(new Date(), invitation.expiresAt)
	const menuAria = `Open actions menu for ${invitation.email}`
	const resendAria = `Resend invitation to ${invitation.email}`
	const cancelAria = `Cancel invitation for ${invitation.email}`

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			transition={{ duration: 0.2, delay: index * 0.05 }}
		>
			<Card className="bg-white">
				<CardContent className="p-4">
					<div className="flex items-start justify-between">
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2 mb-2">
								<Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
								<span className="font-medium truncate">{invitation.email}</span>
							</div>
							<div className="flex items-center gap-2 flex-wrap mb-2">
								<RoleBadge role={invitation.role} />
								{invitation.title && (
									<Badge variant="outline" className="text-xs">
										{invitation.title}
									</Badge>
								)}
								<Badge
									variant={isExpired ? 'destructive' : 'secondary'}
									className="capitalize"
								>
									{isExpired ? 'Expired' : invitation.status}
								</Badge>
							</div>
							<p className="text-xs text-muted-foreground">
								Invited{' '}
								{formatDistanceToNow(invitation.invitedAt, { addSuffix: true })}
							</p>
						</div>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									aria-label={menuAria}
									className="h-8 w-8 p-0 focus:opacity-100"
								>
									<MoreHorizontal className="h-4 w-4" aria-hidden="true" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem
									className="cursor-pointer"
									onClick={() => onResend?.(invitation.id)}
									aria-label={resendAria}
									disabled={isExpired}
								>
									<RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
									Resend Invitation
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									className="text-destructive cursor-pointer"
									onClick={() => onCancel?.(invitation.id)}
									aria-label={cancelAria}
								>
									<X className="mr-2 h-4 w-4" aria-hidden="true" />
									Cancel Invitation
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	)
}
