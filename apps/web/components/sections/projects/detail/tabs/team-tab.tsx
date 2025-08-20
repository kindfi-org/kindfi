'use client'

import { motion } from 'framer-motion'
import { UserAvatar } from '~/components/base/user-avatar'
import type { TeamMember } from '~/lib/types/project/project-detail.types'
import { memberRole } from '~/lib/utils/member-role'

interface TeamTabProps {
	team: TeamMember[]
}

export function TeamTab({ team }: TeamTabProps) {
	return (
		<motion.div
			className="bg-white rounded-xl shadow-sm p-6"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}
		>
			<h2 className="text-2xl font-bold mb-6">Project Team</h2>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{team.map((member) => {
					const role = memberRole[member.role]
					const Icon = role.icon

					return (
						<motion.div
							key={member.id}
							className="flex flex-col items-center p-6 border border-gray-200 rounded-xl text-center"
							whileHover={{
								y: -5,
								boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
							}}
							transition={{ duration: 0.2 }}
						>
							{/* Avatar */}
							<UserAvatar
								src={member.avatar || '/images/placeholder.png'}
								alt={member.displayName}
								name={member.displayName}
								className="h-20 w-20 mb-4"
							/>

							{/* Name + role icon */}
							<div className="flex items-center gap-2 mb-1">
								<h3 className="font-bold text-lg">
									{member.displayName ?? 'Unknown'}
								</h3>
								<Icon
									className={`h-4 w-4 ${role.iconClass}`}
									aria-label={role.label}
								/>
							</div>

							{/* Title */}
							<p className="text-primary font-semibold uppercase">
								{member.title ?? 'Member'}
							</p>

							{/* Bio */}
							<p className="text-sm text-muted-foreground mb-4">
								{member.bio || 'No bio available.'}
							</p>

							{/* Role badge */}
							<span
								className={`${role.badgeClass} text-xs px-2 py-1 rounded-full`}
							>
								{role.label}
							</span>
						</motion.div>
					)
				})}
			</div>
		</motion.div>
	)
}
