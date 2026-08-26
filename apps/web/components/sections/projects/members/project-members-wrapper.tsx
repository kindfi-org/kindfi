'use client'

import { notFound } from 'next/navigation'
import { ManageSectionShell } from '~/components/sections/projects/manage/manage-section-shell'
import { AddTeamMemberForm } from '~/components/sections/projects/members/add-team-member-form'
import { TeamMemberList } from '~/components/sections/projects/members/team-member-list'
import { useManagedProjectQuery } from '~/hooks/projects/use-managed-project-query'
import { useTeamMutation } from '~/hooks/projects/use-team-mutation'
import { useI18n } from '~/lib/i18n/context'
import type { getProjectTeamBySlug } from '~/lib/queries/projects/get-project-team-by-slug'
import type { CreateTeamMemberData } from '~/lib/types/project/project-team.types'

interface ProjectMembersWrapperProps {
	projectSlug: string
}

export function ProjectMembersWrapper({ projectSlug }: ProjectMembersWrapperProps) {
	const { t } = useI18n()
	const { data: teamData, isLoading } = useManagedProjectQuery<
		Awaited<ReturnType<typeof getProjectTeamBySlug>>
	>('project-team', projectSlug, 'team', {
		additionalKeyValues: [projectSlug],
	})
	const { createMember, deleteMember } = useTeamMutation()

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
			<div className="space-y-6" aria-live="polite">
				<div className="h-16 animate-pulse rounded-xl bg-muted" />
				<div className="h-48 animate-pulse rounded-xl bg-muted" />
			</div>
		)
	}

	return (
		<ManageSectionShell
			title={t('projects.manage.teamTitle')}
			description={t('projects.manage.teamDescription')}
		>
			{!isLoading ? (
				<AddTeamMemberForm
					onAdd={handleAddMember}
					excludeUserIds={teamMembers
						.filter((member) => member.userId)
						.map((member) => member.userId as string)}
				/>
			) : null}

			<TeamMemberList members={teamMembers} onDelete={handleDeleteMember} />
		</ManageSectionShell>
	)
}
