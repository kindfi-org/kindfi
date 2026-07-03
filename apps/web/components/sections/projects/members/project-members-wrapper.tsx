'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { notFound } from 'next/navigation'
import { IoPeopleOutline } from 'react-icons/io5'
import { AddTeamMemberForm } from '~/components/sections/projects/members/add-team-member-form'
import { TeamMemberList } from '~/components/sections/projects/members/team-member-list'
import { useManagedProjectQuery } from '~/hooks/projects/use-managed-project-query'
import { useTeamMutation } from '~/hooks/projects/use-team-mutation'
import type { getProjectTeamBySlug } from '~/lib/queries/projects/get-project-team-by-slug'
import type { CreateTeamMemberData } from '~/lib/types/project/project-team.types'

interface ProjectMembersWrapperProps {
	projectSlug: string
}

export function ProjectMembersWrapper({ projectSlug }: ProjectMembersWrapperProps) {
	const { data: teamData, isLoading } = useManagedProjectQuery<
		Awaited<ReturnType<typeof getProjectTeamBySlug>>
	>('project-team', projectSlug, 'team', {
		additionalKeyValues: [projectSlug],
	})
	const { createMember, deleteMember } = useTeamMutation()
	const prefersReducedMotion = useReducedMotion()

	if (!isLoading && !teamData) notFound()

	const teamMembers = teamData?.team ?? []

	const handleAddMember = async (data: CreateTeamMemberData) => {
		if (!teamData) return

		await createMember.mutateAsync({
			projectId: teamData.projectId,
			projectSlug,
			...data,
		})
	}

	const handleDeleteMember = async (memberId: string) => {
		if (!teamData) return

		await deleteMember.mutateAsync({
			projectId: teamData.projectId,
			projectSlug,
			memberId,
		})
	}

	if (isLoading) {
		return (
			<div className="animate-pulse">
				<div className="mx-auto h-64 max-w-4xl rounded-lg bg-muted" />
			</div>
		)
	}

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
					{!isLoading ? <AddTeamMemberForm onAdd={handleAddMember} /> : null}

					{/* Team Members List */}
					<TeamMemberList members={teamMembers} onDelete={handleDeleteMember} />
				</motion.div>
			</motion.div>
		</div>
	)
}
