'use client'

import { AnimatePresence } from 'framer-motion'
import { Clock } from 'lucide-react'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/base/table'
import type { PendingInvitation } from '~/lib/types/project/team-members.types'
import { cn } from '~/lib/utils'
import { InvitationCard } from './invitation-card'
import { InvitationRow } from './invitation-row'

interface PendingInvitationsProps {
	invitations: PendingInvitation[]
	onResend?: (invitationId: string) => void
	onCancel?: (invitationId: string) => void
	className?: string
}

export function PendingInvitations({
	invitations,
	onResend,
	onCancel,
	className,
}: PendingInvitationsProps) {
	if (invitations.length === 0) {
		return (
			<Card className={cn(className, 'bg-white')}>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Clock className="h-5 w-5" aria-hidden="true" />
						Pending Invitations
					</CardTitle>
					<CardDescription>
						No pending invitations at the moment.
					</CardDescription>
				</CardHeader>
			</Card>
		)
	}

	return (
		<div className={className}>
			{/* Desktop Table View */}
			<Card className="hidden md:block bg-white">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Clock className="h-5 w-5" aria-hidden="true" />
						Pending Invitations ({invitations.length})
					</CardTitle>
					<CardDescription>
						Manage invitations that haven't been accepted yet.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Email</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Title</TableHead>
								<TableHead>Invited</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="w-[50px]"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<AnimatePresence>
								{invitations.map((invitation, index) => (
									<InvitationRow
										key={invitation.id}
										invitation={invitation}
										index={index}
										onResend={onResend}
										onCancel={onCancel}
									/>
								))}
							</AnimatePresence>
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* Mobile Card View */}
			<div className="md:hidden space-y-4">
				<div className="flex items-center gap-2">
					<Clock className="h-5 w-5" aria-hidden="true" />
					<h3 className="text-2xl font-semibold">
						Pending Invitations ({invitations.length})
					</h3>
				</div>
				<p className="text-sm text-muted-foreground !mt-1.5">
					Manage invitations that haven't been accepted yet.
				</p>

				<AnimatePresence>
					{invitations.map((invitation, index) => (
						<InvitationCard
							key={invitation.id}
							invitation={invitation}
							index={index}
							onResend={onResend}
							onCancel={onCancel}
						/>
					))}
				</AnimatePresence>
			</div>
		</div>
	)
}
