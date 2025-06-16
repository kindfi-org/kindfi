import { ClockIcon, UserCheckIcon, UserIcon, UserXIcon } from 'lucide-react'
import type { MetricConfig } from '../types/dashboard'

export const metricsConfig: MetricConfig[] = [
	{
		key: 'totalUsers',
		title: 'Total Users',
		icon: UserIcon,
		iconColor: 'text-primary',
		text: 'Growing user base',
		description: 'Total registered users',
	},
	{
		key: 'pending',
		title: 'KYC Pending',
		icon: ClockIcon,
		iconColor: 'text-orange-500',
		text: 'Awaiting review',
		description: 'Users pending verification',
	},
	{
		key: 'approved',
		title: 'KYC Approved',
		icon: UserCheckIcon,
		iconColor: 'text-green-500',
		text: 'Verification complete',
		description: 'Successfully verified users',
	},
	{
		key: 'rejected',
		title: 'KYC Rejected',
		icon: UserXIcon,
		iconColor: 'text-red-500',
		text: 'Verification failed',
		description: 'Users requiring resubmission',
	},
]

export const timeRanges = [
	{ label: 'Last 3 months', value: '90d' },
	{ label: 'Last 30 days', value: '30d' },
	{ label: 'Last 7 days', value: '7d' },
]
