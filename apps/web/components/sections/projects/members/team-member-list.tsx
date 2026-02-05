'use client'

import { motion } from 'framer-motion'
import { User } from 'lucide-react'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import type { ProjectTeamMember } from '~/lib/types/project/project-team.types'
import { cn } from '~/lib/utils'
import { TeamMemberCard } from './team-member-card'

interface TeamMemberListProps {
	members: ProjectTeamMember[]
	onEdit?: (member: ProjectTeamMember) => void
	onDelete?: (memberId: string) => void
	className?: string
}

export function TeamMemberList({
	members,
	onEdit,
	onDelete,
	className,
}: TeamMemberListProps) {
	if (members.length === 0) {
		return (
			<Card className={cn(className, 'border border-border bg-card shadow-sm')}>
				<CardContent className="flex flex-col items-center justify-center py-12">
					<User
						className="h-12 w-12 text-muted-foreground mb-4"
						aria-hidden="true"
					/>
					<h3 className="text-lg font-semibold mb-2">No team members yet</h3>
					<p className="text-muted-foreground text-center max-w-md">
						Add team members to showcase who&apos;s behind this project. Start
						by adding your first team member above.
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className={className}>
			<Card className="border border-border bg-card shadow-sm">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<User className="h-5 w-5" aria-hidden="true" />
						Project Team ({members.length})
					</CardTitle>
					<CardDescription>
						The people behind this project and their contributions.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{members.map((member, index) => (
							<TeamMemberCard
								key={member.id}
								member={member}
								index={index}
								onEdit={onEdit}
								onDelete={onDelete}
							/>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
