'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import type { Enums } from '@services/supabase'
import { notFound, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { InviteMemberForm } from '~/components/sections/projects/members/invite-member-form'
import { MemberList } from '~/components/sections/projects/members/member-list'
import { PendingInvitations } from '~/components/sections/projects/members/pending-invitations'
import {
	InviteMemberFormSkeleton,
	MemberListSkeleton,
	PendingInvitationsSkeleton,
} from '~/components/sections/projects/members/skeletons'
import { BreadcrumbContainer } from '~/components/sections/projects/shared'
import { useMembersMutation } from '~/hooks/projects/use-members-mutation'
import { getProjectMembersDataBySlug } from '~/lib/queries/projects/get-project-members-data-by-slug'
import type {
	InviteMemberData,
	PendingInvitation,
	ProjectMember,
} from '~/lib/types/project/team-members.types'
import { BreadcrumbSkeleton } from '../detail/skeletons'

interface ProjectMembersWrapperProps {
	projectSlug: string
}

export function ProjectMembersWrapper({
	projectSlug,
}: ProjectMembersWrapperProps) {
	const {
		data: project,
		isLoading,
		error,
	} = useSupabaseQuery(
		'project-members',
		(client) => getProjectMembersDataBySlug(client, projectSlug),
		{ additionalKeyValues: [projectSlug] },
	)

	if (error || !project) notFound()

	// actual auth user id
	const currentUserId = project.currentUserId ?? null

	const { updateRole, updateTitle, removeMember } = useMembersMutation()
	const router = useRouter()

	const initialMembers = project.team

	// Local UI state (optimistic updates)
	const [members, setMembers] = useState<ProjectMember[]>(initialMembers)
	const [pendingInvitations, setPendingInvitations] = useState<
		PendingInvitation[]
	>([])

	// Sync local members when server data changes (after load)
	useEffect(() => {
		setMembers(initialMembers)
	}, [initialMembers])

	// TODO: replace with real server action / route
	const handleInviteMember = async (data: InviteMemberData) => {
		const request = new Promise<void>((resolve) => setTimeout(resolve, 900))

		const id =
			typeof crypto !== 'undefined' && 'randomUUID' in crypto
				? crypto.randomUUID()
				: `inv-${Date.now()}`
		const miid =
			typeof crypto !== 'undefined' && 'randomUUID' in crypto
				? crypto.randomUUID()
				: Math.random().toString(36).slice(2, 11)

		const optimistic: PendingInvitation = {
			id,
			miid,
			projectId: project.id,
			email: data.email,
			role: data.role,
			title: data.title,
			invitedBy: currentUserId,
			invitedAt: new Date(),
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			status: 'pending',
		}

		setPendingInvitations((prev) => [optimistic, ...prev])

		try {
			await toast.promise(request, {
				loading: 'Sending invitation…',
				success: `Invitation sent to ${data.email}`,
				error: 'Failed to send invitation. Please try again.',
			})
			// Reconcile with API response if needed
		} catch {
			// Rollback
			setPendingInvitations((prev) =>
				prev.filter((inv) => inv.id !== optimistic.id),
			)
		}
	}

	// TODO: replace with real server action / route
	const handleResendInvitation = async (invitationId: string) => {
		try {
			await toast.promise(new Promise((r) => setTimeout(r, 500)), {
				loading: 'Resending…',
				success: 'Invitation has been resent successfully.',
				error: 'Failed to resend invitation. Please try again.',
			})
		} catch {}
	}

	// TODO: replace with real server action / route
	const handleCancelInvitation = async (invitationId: string) => {
		const snapshot = [...pendingInvitations]
		setPendingInvitations((prev) =>
			prev.filter((inv) => inv.id !== invitationId),
		)
		try {
			await toast.promise(new Promise((r) => setTimeout(r, 500)), {
				loading: 'Cancelling…',
				success: 'Invitation has been cancelled successfully.',
				error: 'Failed to cancel invitation. Please try again.',
			})
		} catch {
			setPendingInvitations(snapshot) // rollback
		}
	}

	const handleChangeRole = async (
		memberId: string,
		role: Enums<'project_member_role'>,
	) => {
		const snapshot = [...members]
		setMembers((prev) =>
			prev.map((m) => (m.id === memberId ? { ...m, role } : m)),
		)

		try {
			await updateRole.mutateAsync({
				projectId: project.id,
				projectSlug,
				memberId,
				role,
			})
		} catch {
			// rollback on error
			setMembers(snapshot)
		}
	}

	const handleChangeTitle = async (memberId: string, title: string) => {
		const snapshot = [...members]
		setMembers((prev) =>
			prev.map((m) => (m.id === memberId ? { ...m, title } : m)),
		)

		try {
			await updateTitle.mutateAsync({
				projectId: project.id,
				projectSlug,
				memberId,
				title,
			})
		} catch {
			setMembers(snapshot) // rollback
		}
	}

	const handleRemoveMember = async (memberId: string) => {
		const snapshot = [...members]
		setMembers((prev) => prev.filter((m) => m.id !== memberId))

		try {
			await removeMember.mutateAsync({
				projectId: project.id,
				projectSlug,
				memberId,
			})
			router.push(`/projects/${projectSlug}`)
		} catch {
			setMembers(snapshot) // rollback
		}
	}

	const category = project.category?.slug
		? { name: project.category.name, slug: project.category.slug }
		: undefined

	return (
		<>
			<div className="flex flex-col items-center justify-center mb-8">
				{isLoading ? (
					<BreadcrumbSkeleton />
				) : (
					<BreadcrumbContainer
						category={category}
						title={project.title}
						manageSection="Project Management"
						subSection="Members"
					/>
				)}

				<div className="inline-flex items-center px-4 py-2 rounded-full font-medium text-purple-600 bg-purple-100 border-transparent mb-4">
					Project Management
				</div>

				<h1 className="text-3xl md:text-4xl font-bold mb-4 py-2 sm:text-center gradient-text">
					Team Members
				</h1>
				<p className="text-xl text-muted-foreground max-w-5xl mx-auto">
					Manage your project team members, roles, and invitations.
				</p>
			</div>

			<div className="space-y-8 max-w-2xl mx-auto">
				{/* Invite Member Form */}
				{isLoading ? (
					<InviteMemberFormSkeleton />
				) : (
					<InviteMemberForm onInvite={handleInviteMember} />
				)}

				{/* Pending Invitations */}
				{isLoading ? (
					<PendingInvitationsSkeleton />
				) : (
					<PendingInvitations
						invitations={pendingInvitations}
						onResend={handleResendInvitation}
						onCancel={handleCancelInvitation}
					/>
				)}

				{/* Active Members List */}
				{isLoading ? (
					<MemberListSkeleton />
				) : (
					<MemberList
						members={members}
						currentUserId={currentUserId}
						onRemoveMember={handleRemoveMember}
						onChangeRole={handleChangeRole}
						onChangeTitle={handleChangeTitle}
					/>
				)}
			</div>
		</>
	)
}
