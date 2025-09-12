'use client'

import type { Enums } from '@services/supabase'
import { formatDistanceToNow } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import {
	Check,
	Crown,
	MoreHorizontal,
	Pencil,
	Shield,
	User,
	UserMinus,
	X as XIcon,
} from 'lucide-react'
import { useState } from 'react'

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
import { Input } from '~/components/base/input'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/base/table'
import { PLACEHOLDER_IMG } from '~/lib/constants/paths'
import type { ProjectMember } from '~/lib/types/project/team-members.types'
import { cn, getAvatarFallback } from '~/lib/utils'
import { memberRole } from '~/lib/utils/member-role'
import { MobileMemberList } from './mobile-member-list'
import { RoleBadge } from './role-badge'

interface MemberListProps {
	members: ProjectMember[]
	currentUserId?: string
	onRemoveMember?: (memberId: string) => void
	onChangeRole?: (memberId: string, role: Enums<'project_member_role'>) => void
	onChangeTitle?: (memberId: string, title: string) => void
	className?: string
}

export function MemberList({
	members,
	currentUserId,
	onRemoveMember,
	onChangeRole,
	onChangeTitle,
	className,
}: MemberListProps) {
	const [editingId, setEditingId] = useState<string | null>(null)
	const [tempTitle, setTempTitle] = useState<string>('')

	const startEdit = (memberId: string, currentTitle: string | null) => {
		setEditingId(memberId)
		setTempTitle(currentTitle ?? '')
	}

	const commitEdit = (memberId: string) => {
		onChangeTitle?.(memberId, tempTitle.trim())
		setEditingId(null)
		setTempTitle('')
	}

	const cancelEdit = () => {
		setEditingId(null)
		setTempTitle('')
	}

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
															src={member.avatar || PLACEHOLDER_IMG}
															alt={member.name}
														/>
														<AvatarFallback>
															{getAvatarFallback(member.name)}
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

											{/* Title editable */}
											<TableCell>
												{editingId === member.id ? (
													<div className="flex items-center gap-2">
														<Input
															value={tempTitle}
															onChange={(e) => setTempTitle(e.target.value)}
															placeholder="Enter a title"
															className="h-8 bg-white"
															aria-label={`Edit title for ${member.name}`}
															autoFocus
															onKeyDown={(e) => {
																if (e.key === 'Enter') commitEdit(member.id)
																if (e.key === 'Escape') cancelEdit()
															}}
														/>
														<Button
															size="icon"
															variant="ghost"
															aria-label={`Save title for ${member.name}`}
															onClick={() => commitEdit(member.id)}
														>
															<Check className="h-4 w-4" aria-hidden="true" />
														</Button>
														<Button
															size="icon"
															variant="ghost"
															aria-label={`Cancel title edit for ${member.name}`}
															onClick={cancelEdit}
														>
															<XIcon className="h-4 w-4" aria-hidden="true" />
														</Button>
													</div>
												) : (
													<div className="flex items-center gap-2">
														<span className="text-sm">
															{member.title || (
																<span className="text-muted-foreground">—</span>
															)}
														</span>
														{!member.isOwner &&
															member.userId !== currentUserId && (
																<Button
																	size="icon"
																	variant="ghost"
																	aria-label={`Edit title for ${member.name}`}
																	onClick={() =>
																		startEdit(member.id, member.title ?? '')
																	}
																>
																	<Pencil
																		className="h-4 w-4"
																		aria-hidden="true"
																	/>
																</Button>
															)}
													</div>
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
															className="bg-white min-w-[220px]"
															align="end"
														>
															<div className="px-2 py-1.5 text-xs text-muted-foreground">
																Change role
															</div>
															{(
																Object.keys(memberRole) as Array<
																	Enums<'project_member_role'>
																>
															).map((rk) => {
																const meta = memberRole[rk]
																const Icon = meta.icon
																const isCurrent = rk === member.role
																return (
																	<DropdownMenuItem
																		key={rk}
																		className={cn(
																			'cursor-pointer',
																			isCurrent && 'opacity-60',
																		)}
																		onClick={() =>
																			onChangeRole?.(member.id, rk)
																		}
																		aria-label={`Set role ${meta.label} for ${member.name}`}
																	>
																		<Badge
																			className={cn(
																				'inline-flex items-center gap-1.5 px-2.5 py-1 leading-none',
																				meta.badgeClass,
																			)}
																		>
																			<Icon
																				className={cn(
																					'h-3.5 w-3.5',
																					meta.iconClass,
																				)}
																				aria-hidden="true"
																			/>
																			{meta.label}
																		</Badge>
																	</DropdownMenuItem>
																)
															})}

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
			<MobileMemberList
				members={members}
				currentUserId={currentUserId}
				onRemoveMember={onRemoveMember}
				onChangeRole={onChangeRole}
				onChangeTitle={onChangeTitle}
			/>
		</div>
	)
}
