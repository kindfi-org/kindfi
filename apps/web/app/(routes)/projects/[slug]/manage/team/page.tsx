'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { BreadcrumbContainer } from '~/components/sections/projects/shared'
import { InviteMemberForm } from '~/components/sections/projects/team/invite-member-form'
import { PendingInvitations } from '~/components/sections/projects/team/pending-invitations'
import {
	InviteMemberFormSkeleton,
	PendingInvitationsSkeleton,
} from '~/components/sections/projects/team/skeletons'
import type {
	InviteMemberData,
	PendingInvitation,
} from '~/lib/types/project/team-members.types'

export default function ProjectMembersPage() {
	const [isLoading, setIsLoading] = useState(false)
	const [pendingInvitations, setPendingInvitations] = useState<
		PendingInvitation[]
	>([])

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
			// If your API returns final data, you could reconcile here (e.g. real id)
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
			/* no-op, toast already shows error */
		}
	}

	const handleCancelInvitation = async (invitationId: string) => {
		console.log(invitationId)
		// Optimistic: remove first, rollback if it fails
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
			// Rollback
			setPendingInvitations(snapshot)
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
			</div>
		</>
	)
}
