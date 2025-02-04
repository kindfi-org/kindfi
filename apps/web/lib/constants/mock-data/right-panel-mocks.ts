import { Heart, Trophy, Users } from 'lucide-react'
import type { Activity, Update } from '~/lib/types/right-side-panel'

export const mockUpdates: Update[] = [
	{
		id: '1',
		title: 'New milestone achieved!',
		description: 'Project X has completed their first milestone',
		timestamp: '2 hours ago',
	},
	{
		id: '2',
		title: 'Funding goal reached',
		description: 'Project Y has reached their funding goal',
		timestamp: '5 hours ago',
	},
	{
		id: '3',
		title: 'New project update',
		description: 'Project Z has posted a new update',
		timestamp: '1 day ago',
	},
]

export const mockActivities: Activity[] = [
	{
		id: '1',
		title: 'Supported Clean Ocean Project',
		timestamp: '2 hours ago',
		type: 'contribution',
		icon: Heart,
	},
	{
		id: '2',
		title: 'Referred 2 new supporters',
		timestamp: '5 hours ago',
		type: 'referral',
		icon: Users,
	},
	{
		id: '3',
		title: 'Milestone Completed',
		timestamp: '1 day ago',
		type: 'milestone',
		icon: Trophy,
	},
]
