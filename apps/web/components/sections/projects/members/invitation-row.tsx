'use client'

import { formatDistanceToNow, isAfter } from 'date-fns'
import { motion } from 'framer-motion'
import { Mail, MoreHorizontal, RefreshCw, X } from 'lucide-react'

import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '~/components/base/dropdown-menu'
import { TableCell } from '~/components/base/table'
import type { PendingInvitation } from '~/lib/types/project/team-members.types'
import { RoleBadge } from './role-badge'

interface InvitationRowProps {
	invitation: PendingInvitation
	index: number
	onResend?: (id: string) => void
	onCancel?: (id: string) => void
}

export function InvitationRow({
	invitation,
	index,
	onResend,
	onCancel,
}: InvitationRowProps) {
	const isExpired = isAfter(new Date(), new Date(invitation.expiresAt))
	const menuAria = `Open actions menu for ${invitation.email}`
	const resendAria = `Resend invitation to ${invitation.email}`
	const cancelAria = `Cancel invitation for ${invitation.email}`

	return (
		<motion.tr
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			transition={{ duration: 0.2, delay: Math.min(index * 0.05, 0.6) }}
			className="group hover:bg-muted/50"
		>
			<TableCell>
				<div className="flex items-center gap-2">
					<Mail className="h-4 w-4 text-muted-foreground" />
					<span className="font-medium">{invitation.email}</span>
				</div>
			</TableCell>
			<TableCell>
				<RoleBadge role={invitation.role} />
			</TableCell>
			<TableCell>
				{invitation.title ? (
					<span className="text-sm">{invitation.title}</span>
				) : (
					<span className="text-sm text-muted-foreground">—</span>
				)}
			</TableCell>
			<TableCell>
				<span className="text-sm text-muted-foreground">
					{formatDistanceToNow(new Date(invitation.invitedAt), {
						addSuffix: true,
					})}
				</span>
			</TableCell>
			<TableCell>
				<Badge
					variant={isExpired ? 'destructive' : 'secondary'}
					className="capitalize"
				>
					{isExpired ? 'Expired' : invitation.status}
				</Badge>
			</TableCell>
			<TableCell>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							aria-label={menuAria}
							className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 transition-opacity"
						>
							<MoreHorizontal className="h-4 w-4" aria-hidden="true" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="bg-white" align="end">
						<DropdownMenuItem
							className="cursor-pointer"
							onClick={() => onResend?.(invitation.id)}
							aria-label={resendAria}
							disabled={isExpired}
						>
							<RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
							Resend
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="text-destructive cursor-pointer"
							onClick={() => onCancel?.(invitation.id)}
							aria-label={cancelAria}
						>
							<X className="mr-2 h-4 w-4" aria-hidden="true" />
							Cancel
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</TableCell>
		</motion.tr>
	)
}
