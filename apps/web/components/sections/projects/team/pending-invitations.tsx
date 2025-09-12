'use client'

import { formatDistanceToNow, isAfter } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import { Clock, Mail, MoreHorizontal, RefreshCw, X } from 'lucide-react'

import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '~/components/base/dropdown-menu'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/base/table'
import type { PendingInvitation } from '~/lib/types/project/team-members.types'
import { cn } from '~/lib/utils'
import { memberRole } from '~/lib/utils/member-role'

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
						<Clock className="h-5 w-5" />
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
						<Clock className="h-5 w-5" />
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
								{invitations.map((invitation, index) => {
									const isExpired = isAfter(new Date(), invitation.expiresAt)
									return (
										<motion.tr
											key={invitation.id}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -20 }}
											transition={{ duration: 0.2, delay: index * 0.05 }}
											className="group"
										>
											<TableCell>
												<div className="flex items-center gap-2">
													<Mail className="h-4 w-4 text-muted-foreground" />
													<span className="font-medium">
														{invitation.email}
													</span>
												</div>
											</TableCell>
											<TableCell>
												<RoleBadge role={invitation.role} />
											</TableCell>
											<TableCell>
												{invitation.title ? (
													<span className="text-sm">{invitation.title}</span>
												) : (
													<span className="text-sm text-muted-foreground">
														—
													</span>
												)}
											</TableCell>
											<TableCell>
												<span className="text-sm text-muted-foreground">
													{formatDistanceToNow(invitation.invitedAt, {
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
															className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
														>
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent className="bg-white" align="end">
														<DropdownMenuItem
															className="cursor-pointer"
															onClick={() => onResend?.(invitation.id)}
															disabled={isExpired}
														>
															<RefreshCw className="mr-2 h-4 w-4" />
															Resend
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															className="text-destructive cursor-pointer"
															onClick={() => onCancel?.(invitation.id)}
														>
															<X className="mr-2 h-4 w-4" />
															Cancel
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</motion.tr>
									)
								})}
							</AnimatePresence>
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* Mobile Card View */}
			<div className="md:hidden space-y-4">
				<div className="flex items-center gap-2">
					<Clock className="h-5 w-5" />
					<h3 className="text-2xl font-semibold">
						Pending Invitations ({invitations.length})
					</h3>
				</div>
				<p className="text-sm text-muted-foreground !mt-1.5">
					Manage invitations that haven't been accepted yet.
				</p>
				<AnimatePresence>
					{invitations.map((invitation, index) => {
						const isExpired = isAfter(new Date(), invitation.expiresAt)
						return (
							<motion.div
								key={invitation.id}
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
													<span className="font-medium truncate">
														{invitation.email}
													</span>
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
													{formatDistanceToNow(invitation.invitedAt, {
														addSuffix: true,
													})}
												</p>
											</div>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant="ghost"
														size="sm"
														className="h-8 w-8 p-0"
													>
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem
														onClick={() => onResend?.(invitation.id)}
														disabled={isExpired}
													>
														<RefreshCw className="mr-2 h-4 w-4" />
														Resend Invitation
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														className="text-destructive"
														onClick={() => onCancel?.(invitation.id)}
													>
														<X className="mr-2 h-4 w-4" />
														Cancel Invitation
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						)
					})}
				</AnimatePresence>
			</div>
		</div>
	)
}

function RoleBadge({ role }: { role: PendingInvitation['role'] }) {
	const meta = memberRole[role]
	const Icon = meta.icon
	return (
		<Badge
			variant="secondary"
			className={cn(
				'inline-flex items-center gap-1.5 px-2.5 py-1 leading-none',
				meta.badgeClass,
			)}
		>
			<Icon className={cn('h-3.5 w-3.5', meta.iconClass)} />
			{meta.label}
		</Badge>
	)
}
