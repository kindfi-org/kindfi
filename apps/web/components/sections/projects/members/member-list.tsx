'use client'

import type { Enums } from '@services/supabase'
import { Shield } from 'lucide-react'
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
import type { ProjectMember } from '~/lib/types/project/team-members.types'
import { cn } from '~/lib/utils'
import { MemberCard } from './member-card'
import { MemberRow } from './member-row'

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
	if (members.length === 0) {
		return (
			<Card className={cn(className, 'bg-white')}>
				<CardContent className="flex flex-col items-center justify-center py-12">
					<svg
						aria-hidden
						viewBox="0 0 24 24"
						className="h-12 w-12 text-muted-foreground mb-4"
					>
						<circle cx="12" cy="7" r="4" />
						<path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
					</svg>
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
							{members.map((member, index) => (
								<MemberRow
									key={member.id}
									member={member}
									index={index}
									currentUserId={currentUserId}
									onRemoveMember={onRemoveMember}
									onChangeRole={onChangeRole}
									onChangeTitle={onChangeTitle}
								/>
							))}
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

				{members.map((member, index) => (
					<MemberCard
						key={member.id}
						member={member}
						index={index}
						currentUserId={currentUserId}
						onRemoveMember={onRemoveMember}
						onChangeRole={onChangeRole}
						onChangeTitle={onChangeTitle}
					/>
				))}
			</div>
		</div>
	)
}
