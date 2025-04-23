import type { SuccessStory } from '~/lib/types/impact/impact-success-story.types'

export const successStories: SuccessStory[] = [
	{
		id: 'clean-water',
		title: 'Clean Water Initiative',
		location: 'Rural Schools, Kenya',
		image: '/placeholder.svg?height=400&width=600',
		donors: 500,
		milestones: {
			completed: 5,
			total: 5,
		},
		raised: 50000,
		target: 50000,
	},
	{
		id: 'solar-power',
		title: 'Solar Power for Communities',
		location: 'Remote Villages, India',
		image: '/placeholder.svg?height=400&width=600',
		donors: 650,
		milestones: {
			completed: 4,
			total: 4,
		},
		raised: 75000,
		target: 75000,
	},
	{
		id: 'education-tech',
		title: 'Education Technology Access',
		location: 'Urban Schools, Brazil',
		image: '/placeholder.svg?height=400&width=600',
		donors: 300,
		milestones: {
			completed: 3,
			total: 3,
		},
		raised: 30000,
		target: 30000,
	},
]
