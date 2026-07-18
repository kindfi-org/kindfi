import type { IconType } from 'react-icons'
import {
	IoBusinessOutline,
	IoCheckmarkCircleOutline,
	IoCloseCircleOutline,
	IoCreateOutline,
	IoEyeOutline,
	IoFlagOutline,
	IoFolderOutline,
	IoPauseCircleOutline,
	IoPeopleOutline,
	IoPlayCircleOutline,
	IoShieldCheckmarkOutline,
} from 'react-icons/io5'
import type { AdminStats } from '~/lib/queries/admin/get-admin-stats'

export type MainStatConfig = {
	label: string
	value: number
	icon: IconType
	color: string
	bgColor: string
	change: string
}

export type ProjectStatConfig = {
	label: string
	value: number
	icon: IconType
	color: string
	bgColor: string
}

export type UserStatConfig = {
	label: string
	value: number
	color: string
	bgColor: string
}

export const buildMainStats = (stats: AdminStats): MainStatConfig[] => [
	{
		label: 'Total Projects',
		value: stats.totalProjects,
		icon: IoFolderOutline,
		color: 'text-blue-600',
		bgColor: 'bg-blue-100',
		change: `+${stats.recentActivity.projects} this week`,
	},
	{
		label: 'Total Foundations',
		value: stats.totalFoundations,
		icon: IoBusinessOutline,
		color: 'text-purple-600',
		bgColor: 'bg-purple-100',
		change: `+${stats.recentActivity.foundations} this week`,
	},
	{
		label: 'Total Users',
		value: stats.totalUsers,
		icon: IoPeopleOutline,
		color: 'text-green-700',
		bgColor: 'bg-green-200',
		change: `+${stats.recentActivity.users} this week`,
	},
	{
		label: 'Total Escrows',
		value: stats.totalEscrows,
		icon: IoShieldCheckmarkOutline,
		color: 'text-orange-600',
		bgColor: 'bg-orange-100',
		change: 'Active contracts',
	},
]

export const buildProjectStats = (stats: AdminStats): ProjectStatConfig[] => [
	{
		label: 'Active Projects',
		value: stats.activeProjects,
		icon: IoPlayCircleOutline,
		color: 'text-emerald-700',
		bgColor: 'bg-emerald-200',
	},
	{
		label: 'Draft Projects',
		value: stats.draftProjects,
		icon: IoCreateOutline,
		color: 'text-gray-600',
		bgColor: 'bg-gray-100',
	},
	{
		label: 'In Review',
		value: stats.reviewProjects,
		icon: IoEyeOutline,
		color: 'text-yellow-600',
		bgColor: 'bg-yellow-100',
	},
	{
		label: 'Milestone Reviews',
		value: stats.pendingMilestoneReviews,
		icon: IoFlagOutline,
		color: 'text-amber-700',
		bgColor: 'bg-amber-100',
	},
	{
		label: 'Funded Projects',
		value: stats.fundedProjects,
		icon: IoCheckmarkCircleOutline,
		color: 'text-indigo-600',
		bgColor: 'bg-indigo-100',
	},
	{
		label: 'Paused Projects',
		value: stats.pausedProjects,
		icon: IoPauseCircleOutline,
		color: 'text-orange-600',
		bgColor: 'bg-orange-100',
	},
	{
		label: 'Rejected Projects',
		value: stats.rejectedProjects,
		icon: IoCloseCircleOutline,
		color: 'text-red-600',
		bgColor: 'bg-red-100',
	},
]

export const buildUserStats = (stats: AdminStats): UserStatConfig[] => [
	{
		label: 'Admins',
		value: stats.adminUsers,
		color: 'text-red-600',
		bgColor: 'bg-red-100',
	},
	{
		label: 'Creators',
		value: stats.creatorUsers,
		color: 'text-purple-600',
		bgColor: 'bg-purple-100',
	},
	{
		label: 'Donors',
		value: stats.donorUsers,
		color: 'text-blue-600',
		bgColor: 'bg-blue-100',
	},
	{
		label: 'Kinders',
		value: stats.kinderUsers,
		color: 'text-green-600',
		bgColor: 'bg-green-100',
	},
	{
		label: 'Kindlers',
		value: stats.kindlerUsers,
		color: 'text-yellow-600',
		bgColor: 'bg-yellow-100',
	},
	{
		label: 'Pending',
		value: stats.pendingUsers,
		color: 'text-gray-600',
		bgColor: 'bg-gray-100',
	},
]
