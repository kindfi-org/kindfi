'use client'

import type { Enums } from '@services/supabase'
import { formatDistanceToNow } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import {
	Check,
	Crown,
	Mail,
	MoreHorizontal,
	Pencil,
	Shield,
	UserMinus,
	X as XIcon,
} from 'lucide-react'
import { useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '~/components/base/avatar'
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
import { Input } from '~/components/base/input'
import { PLACEHOLDER_IMG } from '~/lib/constants/paths'
import type { ProjectMember } from '~/lib/types/project/team-members.types'
import { cn, getAvatarFallback } from '~/lib/utils'
import { memberRole } from '~/lib/utils/member-role'
import { RoleBadge } from './role-badge'

export function MobileMemberList({
	members,
	currentUserId,
	onRemoveMember,
	onChangeRole,
	onChangeTitle,
}: {
	members: ProjectMember[]
	currentUserId?: string
	onRemoveMember?: (memberId: string) => void
	onChangeRole?: (memberId: string, role: Enums<'project_member_role'>) => void
	onChangeTitle?: (memberId: string, title: string) => void
}) {
	const [editingId, setEditingId] = useState<string | null>(null)
	const [tempTitle, setTempTitle] = useState<string>('')

	const handleStartEdit = (memberId: string, current: string | null) => {
		setEditingId(memberId)
		setTempTitle(current ?? '')
	}
	const handleCommitEdit = (memberId: string) => {
		onChangeTitle?.(memberId, tempTitle.trim())
		setEditingId(null)
		setTempTitle('')
	}
	const handleCancelEdit = () => {
		setEditingId(null)
		setTempTitle('')
	}

	return (
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
													src={member.avatar || PLACEHOLDER_IMG}
													alt={member.name}
												/>
												<AvatarFallback>
													{getAvatarFallback(member.name)}
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

												{/* Editable title (mobile) */}
												{editingId === member.id ? (
													<div className="flex items-center gap-2 mb-2">
														<Input
															value={tempTitle}
															onChange={(e) => setTempTitle(e.target.value)}
															placeholder="Enter a title"
															className="h-8 bg-white"
															aria-label={`Edit title for ${member.name}`}
															autoFocus
															onKeyDown={(e) => {
																if (e.key === 'Enter')
																	handleCommitEdit(member.id)
																if (e.key === 'Escape') handleCancelEdit()
															}}
														/>
														<Button
															size="icon"
															variant="ghost"
															aria-label={`Save title for ${member.name}`}
															onClick={() => handleCommitEdit(member.id)}
														>
															<Check className="h-4 w-4" aria-hidden="true" />
														</Button>
														<Button
															size="icon"
															variant="ghost"
															aria-label={`Cancel title edit for ${member.name}`}
															onClick={handleCancelEdit}
														>
															<XIcon className="h-4 w-4" aria-hidden="true" />
														</Button>
													</div>
												) : (
													<div className="flex items-center gap-2 mb-2">
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
																		handleStartEdit(
																			member.id,
																			member.title ?? '',
																		)
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
												<DropdownMenuContent
													align="end"
													className="min-w-[220px]"
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
																	isCurrent && 'opacity-60 cursor-not-allowed',
																)}
																disabled={isCurrent}
																aria-disabled={isCurrent}
																onClick={() => {
																	if (isCurrent) return
																	onChangeRole?.(member.id, rk)
																}}
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
									</div>
								</CardContent>
							</Card>
						</motion.div>
					)
				})}
			</AnimatePresence>
		</div>
	)
}
