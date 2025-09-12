'use client'

import type { Enums } from '@services/supabase'
import { formatDistanceToNow } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import {
	Crown,
	Mail,
	MoreHorizontal,
	Shield,
	User,
	UserCog,
	UserMinus,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/base/avatar'
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
import type { ProjectMember } from '~/lib/types/project/team-members.types'
import { cn } from '~/lib/utils'
import { RoleBadge } from './role-badge'

interface MemberListProps {
	members: ProjectMember[]
	currentUserId?: string
	onRemoveMember?: (memberId: string) => void
	onChangeRole?: (memberId: string, role: Enums<'project_member_role'>) => void
	className?: string
}

export function MemberList({
	members,
	currentUserId,
	onRemoveMember,
	onChangeRole,
	className,
}: MemberListProps) {
	if (members.length === 0) {
		return (
			<Card className={cn(className, 'bg-white')}>
				<CardContent className="flex flex-col items-center justify-center py-12">
					<User
						className="h-12 w-12 text-muted-foreground mb-4"
						aria-hidden="true"
					/>
					<h3 className="text-lg font-semibold mb-2">No team members yet</h3>
					<p className="text-muted-foreground text-center">
						Start building your team by inviting members to collaborate on your
						project.
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className={className}>
			{/* Desktop Table View */}
			<Card className="hidden md:block bg-white">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Shield className="h-5 w-5" aria-hidden="true" />
						Team Members ({members.length})
					</CardTitle>
					<CardDescription>
						Manage your project team members and their roles.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Member</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Title</TableHead>
								<TableHead>Joined</TableHead>
								<TableHead className="w-[50px]"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<AnimatePresence>
								{members.map((member, index) => {
									const menuAria = `Open member menu for ${member.name}`
									const changeAria = `Change role for ${member.name}`
									const removeAria = `Remove ${member.name} from team`

									return (
										<motion.tr
											key={member.id}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -20 }}
											transition={{ duration: 0.2, delay: index * 0.05 }}
											className="group"
										>
											<TableCell>
												<div className="flex items-center gap-3">
													<Avatar className="h-8 w-8">
														<AvatarImage
															src={member.avatar || '/images/placeholder.png'}
															alt={member.name}
														/>
														<AvatarFallback>
															{member.name
																.split(' ')
																.map((n) => n[0])
																.join('')}
														</AvatarFallback>
													</Avatar>
													<div>
														<div className="flex items-center gap-2">
															<span className="font-medium">{member.name}</span>
															{member.isOwner && (
																<Crown
																	className="h-4 w-4 text-yellow-500"
																	aria-hidden="true"
																/>
															)}
														</div>
														<span className="text-sm text-muted-foreground">
															{member.email}
														</span>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<RoleBadge role={member.role} />
											</TableCell>
											<TableCell>
												{member.title ? (
													<span className="text-sm">{member.title}</span>
												) : (
													<span className="text-sm text-muted-foreground">
														—
													</span>
												)}
											</TableCell>
											<TableCell>
												<span className="text-sm text-muted-foreground">
													{formatDistanceToNow(member.joinedAt, {
														addSuffix: true,
													})}
												</span>
											</TableCell>
											<TableCell>
												{!member.isOwner && member.userId !== currentUserId && (
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button
																variant="ghost"
																size="sm"
																className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
																aria-label={menuAria}
															>
																<MoreHorizontal
																	className="h-4 w-4"
																	aria-hidden="true"
																/>
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent
															className="bg-white"
															align="end"
														>
															<DropdownMenuItem
																className="cursor-pointer"
																onClick={() =>
																	onChangeRole?.(member.id, member.role)
																}
																aria-label={changeAria}
															>
																<UserCog
																	className="mr-2 h-4 w-4"
																	aria-hidden="true"
																/>
																Change Role
															</DropdownMenuItem>
															<DropdownMenuSeparator />
															<DropdownMenuItem
																className="text-destructive cursor-pointer"
																onClick={() => onRemoveMember?.(member.id)}
																aria-label={removeAria}
															>
																<UserMinus
																	className="mr-2 h-4 w-4"
																	aria-hidden="true"
																/>
																Remove Member
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												)}
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
					<Shield className="h-5 w-5" aria-hidden="true" />
					<h3 className="text-2xl font-semibold">
						Team Members ({members.length})
					</h3>
				</div>
				<p className="text-sm text-muted-foreground !mt-1.5">
					Manage your project team members and their roles.
				</p>
				<AnimatePresence>
					{members.map((member, index) => {
						const menuAria = `Open member menu for ${member.name}`
						const changeAria = `Change role for ${member.name}`
						const removeAria = `Remove ${member.name} from team`

						return (
							<motion.div
								key={member.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{ duration: 0.2, delay: index * 0.05 }}
							>
								<Card className="bg-white">
									<CardContent className="p-4">
										<div className="flex items-start justify-between">
											<div className="flex items-center gap-3 flex-1">
												<Avatar className="h-10 w-10">
													<AvatarImage
														src={member.avatar || '/images/placeholder.png'}
														alt={member.name}
													/>
													<AvatarFallback>
														{member.name
															.split(' ')
															.map((n) => n[0])
															.join('')}
													</AvatarFallback>
												</Avatar>
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2 mb-1">
														<span className="font-medium truncate">
															{member.name}
														</span>
														{member.isOwner && (
															<Crown
																className="h-4 w-4 text-yellow-500 flex-shrink-0"
																aria-hidden="true"
															/>
														)}
													</div>
													<div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
														<Mail className="h-3 w-3" aria-hidden="true" />
														<span className="truncate">{member.email}</span>
													</div>
													<div className="flex items-center gap-2 flex-wrap">
														<RoleBadge role={member.role} />
														{member.title && (
															<Badge variant="outline" className="text-xs">
																{member.title}
															</Badge>
														)}
													</div>
													<p className="text-xs text-muted-foreground mt-2">
														Joined{' '}
														{formatDistanceToNow(member.joinedAt, {
															addSuffix: true,
														})}
													</p>
												</div>
											</div>
											{!member.isOwner && member.userId !== currentUserId && (
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															variant="ghost"
															size="sm"
															className="h-8 w-8 p-0"
															aria-label={menuAria}
														>
															<MoreHorizontal
																className="h-4 w-4"
																aria-hidden="true"
															/>
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem
															className="cursor-pointer"
															onClick={() =>
																onChangeRole?.(member.id, member.role)
															}
															aria-label={changeAria}
														>
															<UserCog
																className="mr-2 h-4 w-4"
																aria-hidden="true"
															/>
															Change Role
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															className="text-destructive cursor-pointer"
															onClick={() => onRemoveMember?.(member.id)}
															aria-label={removeAria}
														>
															<UserMinus
																className="mr-2 h-4 w-4"
																aria-hidden="true"
															/>
															Remove Member
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											)}
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
