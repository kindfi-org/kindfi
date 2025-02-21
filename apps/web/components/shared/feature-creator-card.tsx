'use client'

import { motion } from 'framer-motion'
import { BadgeCheck } from 'lucide-react'
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/base/avatar'
import { Card } from '~/components/base/card'
import { CTAButtons } from '~/components/shared/cta-buttons'

export interface FeatureCreatorCardProps {
	name: string
	bio: string
	totalRaised: string
	completedProjects: number
	recentProject: string
	followers: number
	avatarUrl?: string
	verified?: boolean
}

export const FeatureCreatorCard = ({
	name,
	bio,
	totalRaised,
	completedProjects,
	recentProject,
	followers,
	avatarUrl,
	verified = true,
}: FeatureCreatorCardProps) => {
	const creatorData = [
		{ id: 'total-raised-id', label: 'Total Raised', value: totalRaised },
		{
			id: 'completed-projects-id',
			label: 'Completed Projects',
			value: completedProjects,
		},
		{ id: 'followers-id', label: 'Followers', value: followers },
	]

	return (
		<Card className="border-none">
			<motion.div
				className="max-w-sm min-w-[24rem] rounded-lg overflow-hidden shadow-lg p-10 bg-white text-left"
				whileHover={{ scale: 1.05 }}
				transition={{ type: 'spring', stiffness: 300 }}
			>
				<div className="flex flex-row items-center">
					<Avatar className="w-20 h-20">
						{avatarUrl ? (
							<AvatarImage src={avatarUrl} alt={`${name}'s avatar`} />
						) : (
							<AvatarFallback />
						)}
					</Avatar>
					<div className="text-left ml-4">
						<h2 className="flex items-center text-xl font-bold">
							{name}
							{verified ? <BadgeCheck size={18} className="ml-2" /> : null}
						</h2>
						<p className="text-gray-600">{bio}</p>
					</div>
				</div>

				<div className="mt-6">
					{creatorData.map((data) => (
						<div key={data.id} className="flex justify-between mb-2">
							<span className="text-md text-gray-600">{data.label}:</span>
							<span className="text-md font-bold">{data.value}</span>
						</div>
					))}
					<div className="my-6">
						<p className="font-semibold mb-2">Recent Project:</p>
						<span className="bg-gray-200 rounded-full py-1 px-4 font-semibold text-sm">
							{recentProject}
						</span>
					</div>
				</div>
				<div className="mt-4 flex justify-center w-full">
					<CTAButtons
						primaryText="View Projects"
						secondaryText="Follow"
						className="flex-row-reverse sm:flex-row-reverse w-full"
						primaryClassName="min-w-[50%]"
						secondaryClassName="min-w-[50%]"
						onPrimaryClick={() => {}}
						onSecondaryClick={() => {}}
					/>
				</div>
			</motion.div>
		</Card>
	)
}
