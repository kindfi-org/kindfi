'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { motion, useReducedMotion } from 'framer-motion'
import { notFound } from 'next/navigation'
import { IoPeopleOutline } from 'react-icons/io5'
import { AddTeamMemberForm } from '~/components/sections/projects/members/add-team-member-form'
import { TeamMemberList } from '~/components/sections/projects/members/team-member-list'
import { useTeamMutation } from '~/hooks/projects/use-team-mutation'
import { getProjectTeamBySlug } from '~/lib/queries/projects/get-project-team-by-slug'
import type { CreateTeamMemberData } from '~/lib/types/project/project-team.types'

interface ProjectMembersWrapperProps {
	projectSlug: string
}

export function ProjectMembersWrapper({
	projectSlug,
}: ProjectMembersWrapperProps) {
	const { data: teamData, isLoading } = useSupabaseQuery(
		'project-team',
		(client) => getProjectTeamBySlug(client, projectSlug),
		{
			additionalKeyValues: [projectSlug],
			refetchOnMount: 'always',
			refetchOnWindowFocus: true,
			staleTime: 0, // Always consider data stale to ensure fresh fetches
		},
	)

	// Only call notFound if project doesn't exist (teamData is null)
	// Errors are handled gracefully by returning empty team array
	if (!teamData) notFound()

	const { createMember, deleteMember } = useTeamMutation()

	// Use teamData directly instead of local state to avoid sync issues
	// React Query will handle the updates automatically
	const teamMembers = teamData.team

	const handleAddMember = async (data: CreateTeamMemberData) => {
		await createMember.mutateAsync({
			projectId: teamData.projectId,
			projectSlug,
			...data,
		})
	}

	const handleDeleteMember = async (memberId: string) => {
		await deleteMember.mutateAsync({
			projectId: teamData.projectId,
			projectSlug,
			memberId,
		})
	}

	const prefersReducedMotion = useReducedMotion()

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative">
			{/* Subtle background pattern */}
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,1,36,0.03)_1px,transparent_0)] bg-[size:32px_32px] opacity-40" />

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
				className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:py-12"
			>
				{/* Header */}
				<motion.header
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{
						delay: prefersReducedMotion ? 0 : 0.1,
						duration: prefersReducedMotion ? 0 : 0.3,
					}}
					className="flex flex-col items-center justify-center mb-8"
				>
					<div className="flex items-center gap-3">
						<div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 p-3 text-white shadow-sm">
							<IoPeopleOutline size={24} className="relative z-10" />
						</div>
						<div>
							<h1 className="text-4xl md:text-5xl font-bold tracking-tight gradient-text">
								Project Team
							</h1>
							<p className="text-lg md:text-xl text-muted-foreground mt-2 text-center">
								Showcase who&apos;s behind this project and their contributions
							</p>
						</div>
					</div>
				</motion.header>

				{/* Content */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{
						delay: prefersReducedMotion ? 0 : 0.2,
						duration: prefersReducedMotion ? 0 : 0.3,
					}}
					className="space-y-8 max-w-4xl mx-auto"
				>
					{/* Add Team Member Form */}
					{!isLoading && <AddTeamMemberForm onAdd={handleAddMember} />}

					{/* Team Members List */}
					{isLoading ? (
						<div className="animate-pulse">
							<div className="h-64 bg-muted rounded-lg" />
						</div>
					) : (
						<TeamMemberList
							members={teamMembers}
							onDelete={handleDeleteMember}
						/>
					)}
				</motion.div>
			</motion.div>
		</div>
	)
}
