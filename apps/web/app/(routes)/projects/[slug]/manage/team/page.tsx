'use client'

import type { Enums } from '@services/supabase'
import { useState } from 'react'
import { toast } from 'sonner'
import { BreadcrumbContainer } from '~/components/sections/projects/shared'
import { InviteMemberForm } from '~/components/sections/projects/team/invite-member-form'
import { MemberList } from '~/components/sections/projects/team/member-list'
import { PendingInvitations } from '~/components/sections/projects/team/pending-invitations'
import {
	InviteMemberFormSkeleton,
	MemberListSkeleton,
	PendingInvitationsSkeleton,
} from '~/components/sections/projects/team/skeletons'
import type {
	InviteMemberData,
	PendingInvitation,
	ProjectMember,
} from '~/lib/types/project/team-members.types'

// Mock data - replace with actual API calls
const mockMembers: ProjectMember[] = [
	{
		id: '1',
		userId: 'user-1',
		projectId: 'project-1',
		email: 'sarah.johnson@example.com',
		name: 'Sarah Johnson',
		avatar: '/images/sarah-johnson.webp',
		role: 'admin',
		title: 'Project Lead',
		joinedAt: new Date('2024-01-15'),
		isOwner: true,
	},
	{
		id: '2',
		userId: 'user-2',
		projectId: 'project-1',
		email: 'michael.chen@example.com',
		name: 'Michael Chen',
		avatar: '/images/michael-chen.webp',
		role: 'editor',
		title: 'Software Engineer',
		joinedAt: new Date('2024-02-01'),
		isOwner: false,
	},
	{
		id: '3',
		userId: 'user-3',
		projectId: 'project-1',
		email: 'david.rodriguez@example.com',
		name: 'David Rodriguez',
		avatar: '/images/david-rodriguez.webp',
		role: 'advisor',
		title: 'UX Designer',
		joinedAt: new Date('2024-02-10'),
		isOwner: false,
	},
]

export default function ProjectMembersPage() {
	const [isLoading, setIsLoading] = useState(false)
	const [pendingInvitations, setPendingInvitations] = useState<
		PendingInvitation[]
	>([])
	const [members, setMembers] = useState<ProjectMember[]>(mockMembers)

	const handleInviteMember = async (data: InviteMemberData) => {
		setIsLoading(true)

		// Simulate your real API (replace with fetch/server action)
		const request = new Promise<void>((resolve) => setTimeout(resolve, 1000))

		// Safe IDs
		const id =
			typeof crypto !== 'undefined' && 'randomUUID' in crypto
				? crypto.randomUUID()
				: `inv-${Date.now()}`
		const miid =
			typeof crypto !== 'undefined' && 'randomUUID' in crypto
				? crypto.randomUUID()
				: Math.random().toString(36).slice(2, 11)

		// Optimistic invitation
		const optimistic: PendingInvitation = {
			id,
			miid,
			projectId: 'project-1',
			email: data.email,
			role: data.role,
			title: data.title,
			invitedBy: 'Sarah Chen',
			invitedAt: new Date(),
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
			status: 'pending',
		}

		setPendingInvitations((prev) => [optimistic, ...prev])

		try {
			await toast.promise(request, {
				loading: 'Sending invitation…',
				success: `Invitation sent to ${data.email}`,
				error: 'Failed to send invitation. Please try again.',
			})
			// If your API returns final data, reconcile here (e.g., real id)
		} catch {
			// Rollback if it fails
			setPendingInvitations((prev) =>
				prev.filter((inv) => inv.id !== optimistic.id),
			)
		} finally {
			setIsLoading(false)
		}
	}

	const handleResendInvitation = async (invitationId: string) => {
		console.log(invitationId)
		try {
			await toast.promise(new Promise((r) => setTimeout(r, 500)), {
				loading: 'Resending…',
				success: 'Invitation has been resent successfully.',
				error: 'Failed to resend invitation. Please try again.',
			})
		} catch {
			/* toast.promise already handled error */
		}
	}

	const handleCancelInvitation = async (invitationId: string) => {
		console.log(invitationId)
		const snapshot = pendingInvitations
		// optimistic remove
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
			// rollback
			setPendingInvitations(snapshot)
		}
	}

	const handleRemoveMember = async (memberId: string) => {
		// optimistic remove
		const snapshot = members
		setMembers((prev) => prev.filter((m) => m.id !== memberId))

		try {
			await toast.promise(new Promise((r) => setTimeout(r, 500)), {
				loading: 'Removing member…',
				success: 'Member removed from the project.',
				error: 'Failed to remove member. Please try again.',
			})
		} catch {
			// rollback
			setMembers(snapshot)
		}
	}

	const handleChangeRole = async (
		memberId: string,
		role: Enums<'project_member_role'>,
	) => {
		// optimistic update
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
			// rollback
			setMembers(snapshot)
		}
	}

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

	return (
		<>
			<div className="flex flex-col items-center justify-center mb-8">
				<BreadcrumbContainer
					category={{ name: 'Education', slug: 'education' }}
					title="Empowering Education"
					manageSection="Project Management"
					subSection="Team"
				/>
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
					<InviteMemberForm
						onInvite={handleInviteMember}
						isLoading={isLoading}
					/>
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
						currentUserId="user-1" // This would come from auth context
						onRemoveMember={handleRemoveMember}
						onChangeRole={handleChangeRole}
						onChangeTitle={handleChangeTitle}
					/>
				)}
			</div>
		</>
	)
}
