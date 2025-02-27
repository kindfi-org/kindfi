import { MessageSquareText, Share2, Star, Users } from 'lucide-react'

import type { RequiredItem, Step, Tip } from '~/lib/types/project/pitch.types'

export const requiredItems: RequiredItem[] = [
	{ id: 'highlights', label: 'Add at least 2 Highlights', completed: false },
	{ id: 'pitch', label: 'Complete your Pitch', completed: false },
	{ id: 'contract', label: 'Review Contract', completed: false },
]

export const tips: Tip[] = [
	{
		id: 'feedback',
		title: 'Get Pitch Feedback',
		description:
			'Share your pitch with our community experts for valuable insights.',
		action: 'Request Feedback',
		icon: MessageSquareText,
	},
	{
		id: 'teaser',
		title: 'Post a Teaser',
		description: 'Build excitement by sharing previews on social media.',
		action: 'Create Post',
		icon: Share2,
	},
	{
		id: 'vip',
		title: 'Leverage VIP Terms',
		description: 'Offer special terms to early supporters and key investors.',
		action: 'Set Terms',
		icon: Star,
	},
	{
		id: 'testimonials',
		title: 'Customer Testimonials',
		description: 'Collect and showcase testimonials from your supporters.',
		action: 'Add Testimonials',
		icon: Users,
	},
]

export const steps: Step[] = [
	{
		id: 'raise',
		title: 'Raise $50K minimum',
		description: 'Set your funding goal and create compelling rewards.',
	},
	{
		id: 'legal',
		title: 'Legal Setup',
		description: 'Complete necessary legal documentation and agreements.',
	},
	{
		id: 'compliance',
		title: 'Compliance Review',
		description: 'Ensure your campaign meets all regulatory requirements.',
	},
	{
		id: 'formC',
		title: 'File Form C',
		description: 'Submit required regulatory filings.',
	},
	{
		id: 'publicRaise',
		title: 'Public Raise',
		description: 'Launch your campaign to the public.',
	},
]
