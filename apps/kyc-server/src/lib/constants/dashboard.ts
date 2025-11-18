import {
	CheckCircle2,
	Clock,
	ClockIcon,
	ShieldCheck,
	UserCheckIcon,
	UserIcon,
	UserXIcon,
	XCircle,
} from 'lucide-react'
import type { MetricConfig, TimeRangeOption } from '../types/dashboard'

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

export const timeRanges: TimeRangeOption[] = [
	{ label: 'Last 3 months', value: '90d' },
	{ label: 'Last 30 days', value: '30d' },
	{ label: 'Last 7 days', value: '7d' },
]

export const STATUS_OPTIONS = {
	pending: {
		label: 'Pending',
		icon: Clock,
		color: 'text-yellow-600 dark:text-yellow-400',
		bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
		borderColor: 'border-yellow-200 dark:border-yellow-800',
	},
	approved: {
		label: 'Approved',
		icon: CheckCircle2,
		color: 'text-green-600 dark:text-green-400',
		bgColor: 'bg-green-50 dark:bg-green-900/20',
		borderColor: 'border-green-200 dark:border-green-800',
	},
	rejected: {
		label: 'Rejected',
		icon: XCircle,
		color: 'text-red-600 dark:text-red-400',
		bgColor: 'bg-red-50 dark:bg-red-900/20',
		borderColor: 'border-red-200 dark:border-red-800',
	},
	verified: {
		label: 'Verified',
		icon: ShieldCheck,
		color: 'text-blue-600 dark:text-blue-400',
		bgColor: 'bg-blue-50 dark:bg-blue-900/20',
		borderColor: 'border-blue-200 dark:border-blue-800',
	},
} as const
