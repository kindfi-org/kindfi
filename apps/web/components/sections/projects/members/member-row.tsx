'use client'

import type { Enums } from '@services/supabase'
import { formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'
import {
	Check,
	MoreHorizontal,
	Pencil,
	UserMinus,
	X as XIcon,
} from 'lucide-react'
import { useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '~/components/base/avatar'
import { Button } from '~/components/base/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '~/components/base/dropdown-menu'
import { Input } from '~/components/base/input'
import { TableCell } from '~/components/base/table'
import { PLACEHOLDER_IMG } from '~/lib/constants/paths'
import type { ProjectMember } from '~/lib/types/project/team-members.types'
import { cn, getAvatarFallback } from '~/lib/utils'
import { memberRole } from '~/lib/utils/member-role'
import { ConfirmRemoveMemberDialog } from './confirm-remove-member-dialog'
import { RoleBadge } from './role-badge'

interface MemberRowProps {
	member: ProjectMember
	index: number
	currentUserId: string | null
	onRemoveMember?: (memberId: string) => void
	onChangeRole?: (memberId: string, role: Enums<'project_member_role'>) => void
	onChangeTitle?: (memberId: string, title: string) => void
}

export function MemberRow({
	member,
	index,
	currentUserId,
	onRemoveMember,
	onChangeRole,
	onChangeTitle,
}: MemberRowProps) {
	const [isEditing, setIsEditing] = useState(false)
	const [tempTitle, setTempTitle] = useState<string>(member.title ?? '')
	const [deleteOpen, setDeleteOpen] = useState(false)

	const isOwner = member.userId === currentUserId

	const saveDisabled =
		tempTitle.trim().length === 0 ||
		tempTitle.trim() === (member.title?.trim() ?? '')

	const handleCommit = () => {
		const next = tempTitle.trim()
		const original = member.title?.trim() ?? ''
		if (!next || next === original) {
			setIsEditing(false)
			return
		}
		onChangeTitle?.(member.id, next)
		setIsEditing(false)
	}

	const menuAria = `Open member menu for ${member.displayName}`
	const removeAria = `Remove ${member.displayName} from team`

	return (
		<motion.tr
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			transition={{ duration: 0.2, delay: Math.min(index * 0.05, 0.6) }}
			className="group hover:bg-muted/50"
		>
			<TableCell>
				<div className="flex items-center gap-3">
					<Avatar className="h-8 w-8">
						<AvatarImage
							src={member.avatar || PLACEHOLDER_IMG}
							alt={member.displayName || 'User Avatar'}
						/>
						<AvatarFallback>
							{getAvatarFallback(member.displayName || '')}
						</AvatarFallback>
					</Avatar>
					<div className="flex flex-col">
						<span className="font-medium">{member.displayName}</span>
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
				{isOwner && isEditing ? (
					<div className="flex items-center justify-between gap-2">
						<Input
							value={tempTitle}
							onChange={(e) => setTempTitle(e.target.value)}
							placeholder="Enter a title"
							className="h-8 bg-white"
							aria-label={`Edit title for ${member.displayName}`}
							autoFocus
							onKeyDown={(e) => {
								if (e.key === 'Enter') handleCommit()
								if (e.key === 'Escape') {
									setTempTitle(member.title ?? '')
									setIsEditing(false)
								}
							}}
						/>
						<Button
							size="icon"
							variant="ghost"
							aria-label={`Save title for ${member.displayName}`}
							onClick={handleCommit}
							disabled={saveDisabled}
							aria-disabled={saveDisabled}
						>
							<Check className="h-4 w-4" aria-hidden="true" />
						</Button>
						<Button
							size="icon"
							variant="ghost"
							aria-label={`Cancel title edit for ${member.displayName}`}
							onClick={() => {
								setTempTitle(member.title ?? '')
								setIsEditing(false)
							}}
						>
							<XIcon className="h-4 w-4" aria-hidden="true" />
						</Button>
					</div>
				) : (
					<div className="flex items-center justify-between gap-2">
						<span className="text-sm">
							{member.title || <span className="text-muted-foreground">—</span>}
						</span>
						{isOwner && (
							<Button
								size="icon"
								variant="ghost"
								aria-label={`Edit title for ${member.displayName}`}
								onClick={() => setIsEditing(true)}
							>
								<Pencil className="h-4 w-4" aria-hidden="true" />
							</Button>
						)}
					</div>
				)}
			</TableCell>

			<TableCell>
				<span className="text-sm text-muted-foreground">
					{formatDistanceToNow(member.joinedAt, { addSuffix: true })}
				</span>
			</TableCell>

			<TableCell>
				{isOwner && (
					<>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100 transition-opacity"
									aria-label={menuAria}
								>
									<MoreHorizontal className="h-4 w-4" aria-hidden="true" />
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
									Object.keys(memberRole) as Array<Enums<'project_member_role'>>
								).map((rk) => {
									const meta = memberRole[rk]
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
											aria-label={`Set role ${meta.label} for ${member.displayName}`}
										>
											<RoleBadge role={rk} />
										</DropdownMenuItem>
									)
								})}

								<DropdownMenuSeparator />
								<DropdownMenuItem
									className="text-destructive cursor-pointer"
									onClick={() => setDeleteOpen(true)}
									aria-label={removeAria}
								>
									<UserMinus className="mr-2 h-4 w-4" aria-hidden="true" />
									Remove Member
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						<ConfirmRemoveMemberDialog
							open={deleteOpen}
							onOpenChange={setDeleteOpen}
							onConfirm={() => {
								setDeleteOpen(false)
								onRemoveMember?.(member.id)
							}}
						/>
					</>
				)}
			</TableCell>
		</motion.tr>
	)
}
