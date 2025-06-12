import {
	CheckCircle2Icon,
	ClockIcon,
	TrendingUpIcon,
	UserCheckIcon,
	UserIcon,
	UserXIcon,
} from 'lucide-react'

export const metricsConfig = [
	{
		key: 'totalUsers' as const,
		title: 'Total Users',
		description: 'Total registered users',
		icon: TrendingUpIcon,
		footer: {
			icon: UserIcon,
			text: 'Growing user base',
			description: 'Total registered users',
		},
	},
	{
		key: 'pending' as const,
		title: 'KYC Pending',
		description: 'Users pending verification',
		icon: ClockIcon,
		iconColor: 'text-orange-500',
		footer: {
			icon: ClockIcon,
			text: 'Awaiting review',
			description: 'Users pending verification',
		},
	},
	{
		key: 'approved' as const,
		title: 'KYC Approved',
		description: 'Successfully verified users',
		icon: CheckCircle2Icon,
		iconColor: 'text-green-500',
		footer: {
			icon: UserCheckIcon,
			text: 'Verification complete',
			description: 'Successfully verified users',
		},
	},
	{
		key: 'rejected' as const,
		title: 'KYC Rejected',
		description: 'Users requiring resubmission',
		icon: UserXIcon,
		iconColor: 'text-red-500',
		footer: {
			icon: UserXIcon,
			text: 'Verification failed',
			description: 'Users requiring resubmission',
		},
	},
]
