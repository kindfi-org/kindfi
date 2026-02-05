'use client'

import { motion } from 'framer-motion'
import { Edit2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/base/avatar'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
} from '~/components/base/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '~/components/base/dialog'
import type { ProjectTeamMember } from '~/lib/types/project/project-team.types'
import { cn } from '~/lib/utils'
import { getInitials } from '~/lib/utils/avatar'

interface TeamMemberCardProps {
	member: ProjectTeamMember
	index: number
	onEdit?: (member: ProjectTeamMember) => void
	onDelete?: (memberId: string) => void
}

export function TeamMemberCard({
	member,
	index,
	onEdit,
	onDelete,
}: TeamMemberCardProps) {
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)
	const initials = getInitials(member.fullName)

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2, delay: index * 0.05 }}
		>
			<Card className="group relative border border-border bg-card hover:shadow-md transition-shadow">
				<CardHeader className="pb-3">
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-3 flex-1 min-w-0">
							<Avatar className="h-12 w-12 flex-shrink-0">
								<AvatarImage
									src={member.photoUrl || undefined}
									alt={member.fullName}
								/>
								<AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
									{initials}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1 min-w-0">
								<h3 className="font-semibold text-lg truncate">
									{member.fullName}
								</h3>
								<p className="text-sm text-muted-foreground truncate">
									{member.roleTitle}
								</p>
							</div>
						</div>
						{(onEdit || onDelete) && (
							<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
								{onEdit && (
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8"
										onClick={() => onEdit(member)}
									>
										<Edit2 className="h-4 w-4" />
									</Button>
								)}
								{onDelete && (
									<Dialog
										open={showDeleteDialog}
										onOpenChange={setShowDeleteDialog}
									>
										<DialogTrigger asChild>
											<Button variant="ghost" size="icon" className="h-8 w-8">
												<Trash2 className="h-4 w-4 text-destructive" />
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Remove Team Member</DialogTitle>
												<DialogDescription>
													Are you sure you want to remove {member.fullName} from
													the project team? This action cannot be undone.
												</DialogDescription>
											</DialogHeader>
											<div className="flex justify-end gap-2 mt-4">
												<Button
													variant="outline"
													onClick={() => setShowDeleteDialog(false)}
												>
													Cancel
												</Button>
												<Button
													variant="destructive"
													onClick={() => {
														onDelete(member.id)
														setShowDeleteDialog(false)
													}}
												>
													Remove
												</Button>
											</div>
										</DialogContent>
									</Dialog>
								)}
							</div>
						)}
					</div>
				</CardHeader>
				<CardContent className="space-y-2">
					{member.bio && (
						<p className="text-sm text-muted-foreground line-clamp-3">
							{member.bio}
						</p>
					)}
					{member.yearsInvolved !== null &&
						member.yearsInvolved !== undefined && (
							<p className="text-xs text-muted-foreground">
								{member.yearsInvolved}{' '}
								{member.yearsInvolved === 1 ? 'year' : 'years'} involved
							</p>
						)}
				</CardContent>
			</Card>
		</motion.div>
	)
}
