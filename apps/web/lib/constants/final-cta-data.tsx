import {
	Apple,
	Facebook,
	Globe,
	Mail,
	Settings,
	Shield,
	Target,
	Zap,
} from 'lucide-react'
import type { Feature, SocialButtonProps, Statistics } from '~/lib/types'

export const features: Feature[] = [
	{
		id: 'feature-1',
		icon: <Zap className="w-6 h-6 text-blue-700" />,
		title: 'Simple Blockchain Experience',
		description:
			'We make blockchain easy. KindFi lets you launch, support, and track social impact projects without needing to understand wallets, contracts, or crypto jargon.',
	},
	{
		id: 'feature-2',
		icon: <Target className="w-6 h-6 text-purple-700" />,
		title: 'Collaborate for Greater Impact',
		description:
			'Support or launch projects using Web3 wallets. Invite others, build reputation, and unlock shared rewards together, we can do more.',
	},
	{
		id: 'feature-3',
		icon: <Shield className="w-6 h-6 text-blue-700" />,
		title: 'Transparency You Can Trust',
		description:
			'Every step is recorded on-chain. From your first donation to the final milestone, you can see where funds go and how change is happening.',
	},
	{
		id: 'feature-4',
		icon: <Settings className="w-6 h-6 text-purple-700" />,
		title: 'Escrow-Backed Verification',
		description:
			'Smart contracts hold funds until goals are reached. Our milestone system guarantees that donations are only released when real progress is verified.',
	},
]

export const socialButtons: SocialButtonProps[] = [
	{
		id: 'email-social-button-id',
		icon: <Mail className="w-5 h-5" />,
		provider: 'Correo',
		onClick: () => console.log('Email login'),
		className: 'bg-teal-600 hover:bg-teal-700 text-white',
	},
	{
		id: 'google-social-button-id',
		icon: <Globe className="w-5 h-5" />,
		provider: 'Google',
		onClick: () => console.log('Google login'),
		className: 'bg-teal-600 hover:bg-teal-700 text-white',
	},
	{
		id: 'facebook-social-button-id',
		icon: <Facebook className="w-5 h-5" />,
		provider: 'Facebook',
		onClick: () => console.log('Facebook login'),
		className: 'bg-teal-600 hover:bg-teal-700 text-white',
	},
	{
		id: 'apple-social-button-id',
		icon: <Apple className="w-5 h-5" />,
		provider: 'Apple',
		onClick: () => console.log('Apple login'),
		className: 'bg-teal-600 hover:bg-teal-700 text-white',
	},
]

export const statistics: Statistics = {
	projects: {
		value: '100+',
		label: 'Verified Projects',
	},
	capitalRaised: {
		value: '$1.7B',
		label:
			'In regional funding can now be unlocked with blockchain transparency',
	},
}
