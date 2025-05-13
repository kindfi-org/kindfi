'use client'

import { motion } from 'framer-motion'
import { Crown, Edit } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/base/avatar'
import type { TeamMember } from '~/lib/types/project/project-detail.types'

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
				{team.map((member) => (
					<motion.div
						key={member.id}
						className="flex flex-col items-center p-6 border border-gray-200 rounded-xl text-center"
						whileHover={{
							y: -5,
							boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
						}}
						transition={{ duration: 0.2 }}
					>
						<Avatar className="h-20 w-20 mb-4">
							<AvatarImage
								src={member.avatar || '/images/placeholder.png'}
								alt={member.displayName ?? 'User Avatar'}
							/>
							<AvatarFallback>
								{member.displayName?.charAt(0).toUpperCase() ?? 'U'}
							</AvatarFallback>
						</Avatar>
						<div className="flex items-center gap-2 mb-1">
							<h3 className="font-bold text-lg">
								{member.displayName ?? 'Unknown'}
							</h3>
							{member.role === 'admin' && (
								<Crown className="h-4 w-4 text-amber-500" aria-label="Admin" />
							)}
							{member.role === 'editor' && (
								<Edit className="h-4 w-4 text-blue-500" aria-label="Editor" />
							)}
						</div>
						<p className="text-primary font-semibold uppercase">
							{member.title ?? 'Member'}
						</p>
						<p className="text-sm text-muted-foreground mb-4">
							{member.bio || 'No bio available.'}
						</p>
						<div className="flex gap-2">
							{member.role === 'admin' && (
								<span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
									Admin
								</span>
							)}
							{member.role === 'editor' && (
								<span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
									Editor
								</span>
							)}
						</div>
					</motion.div>
				))}
			</div>
		</motion.div>
	)
}
