'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { BreadcrumbContainer } from '~/components/sections/projects/shared'
import { InviteMemberForm } from '~/components/sections/projects/team/invite-member-form'
import { InviteMemberFormSkeleton } from '~/components/sections/projects/team/skeletons'
import type { InviteMemberData } from '~/lib/types/project/team-members.types'

export default function ProjectMembersPage() {
	const [isLoading, setIsLoading] = useState(false)

	const handleInviteMember = async (data: InviteMemberData) => {
		setIsLoading(true)

		// Simulate API call
		const request = new Promise<void>((resolve) => setTimeout(resolve, 1000))

		try {
			await toast.promise(request, {
				loading: 'Sending invitation…',
				success: `Invitation sent to ${data.email}`,
				error: 'Failed to send invitation. Please try again.',
			})
		} finally {
			setIsLoading(false)
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
			</div>
		</>
	)
}
