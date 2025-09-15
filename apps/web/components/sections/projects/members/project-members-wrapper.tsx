'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import type { Enums } from '@services/supabase'
import { notFound } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
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

	// Map server `team` to UI `ProjectMember[]`
	const initialMembers: ProjectMember[] = useMemo(
		() =>
			(project.team ?? []).map((m) => ({
				id: m.id,
				userId: m.userId,
				email: m.email ?? '',
				displayName: m.displayName ?? '',
				avatar: m.avatar ?? null,
				role: m.role,
				title: m.title ?? '',
				// joined_at comes as string/Server date -> normalize to Date
				joinedAt: m.joinedAt ? new Date(String(m.joinedAt)) : new Date(0),
			})),
		[project.team],
	)

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
			invitedBy: 'System', // TODO: inject from auth/user context
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
		const snapshot = pendingInvitations
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

	// TODO: replace with real server action / route
	const handleRemoveMember = async (memberId: string) => {
		const snapshot = members
		setMembers((prev) => prev.filter((m) => m.id !== memberId))
		try {
			await toast.promise(new Promise((r) => setTimeout(r, 500)), {
				loading: 'Removing member…',
				success: 'Member removed from the project.',
				error: 'Failed to remove member. Please try again.',
			})
		} catch {
			setMembers(snapshot) // rollback
		}
	}

	// TODO: replace with real server action / route
	const handleChangeRole = async (
		memberId: string,
		role: Enums<'project_member_role'>,
	) => {
		const snapshot = members
		setMembers((prev) =>
			prev.map((m) => (m.id === memberId ? { ...m, role } : m)),
		)
		try {
			await toast.promise(new Promise((r) => setTimeout(r, 500)), {
				loading: 'Updating role…',
				success: 'Member role has been updated.',
				error: 'Failed to update role. Please try again.',
			})
		} catch {
			setMembers(snapshot) // rollback
		}
	}

	// TODO: replace with real server action / route
	const handleChangeTitle = async (memberId: string, title: string) => {
		const snapshot = members
		setMembers((prev) =>
			prev.map((m) => (m.id === memberId ? { ...m, title } : m)),
		)
		try {
			await toast.promise(new Promise((r) => setTimeout(r, 500)), {
				loading: 'Updating title…',
				success: 'Member title has been updated.',
				error: 'Failed to update title. Please try again.',
			})
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
					<InviteMemberForm onInvite={handleInviteMember} isLoading={false} />
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
						// TODO: replace with current user id from your auth context/session
						currentUserId="__replace_with_auth_user_id__"
						onRemoveMember={handleRemoveMember}
						onChangeRole={handleChangeRole}
						onChangeTitle={handleChangeTitle}
					/>
				)}
			</div>
		</>
	)
}
