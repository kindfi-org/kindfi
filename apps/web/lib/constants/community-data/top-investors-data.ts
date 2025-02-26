import type { Investor } from '~/lib/types/investors/top-investors'

export const investorsData: Investor[] = [
	{
		id: 1,
		name: 'Sarah Chen',
		verified: true,
		level: 'Platinum Impact Investor',
		levelClass: 'bg-gray-400',
		image:
			'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-B46AKusqD2Kkdwuuqro1ig9ph2nTXH.png',
		totalImpact: '$250,000',
		projectsSupported: 45,
		followers: '800',
		categories: [
			{ icon: 'Leaf', name: 'Environment' },
			{ icon: 'GraduationCap', name: 'Education' },
		],
		recentProjects: [
			{ name: 'Clean Water Initiative', amount: '$50,000' },
			{ name: 'Solar Power Project', amount: '$35,000' },
		],
	},
	{
		id: 2,
		name: 'Michael Roberts',
		verified: true,
		level: 'Gold Impact Investor',
		levelClass: 'bg-[#FAC118]',
		image:
			'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-B46AKusqD2Kkdwuuqro1ig9ph2nTXH.png',
		totalImpact: '$175,000',
		projectsSupported: 32,
		followers: '850',
		categories: [
			{ icon: 'Stethoscope', name: 'Healthcare' },
			{ icon: 'Handshake', name: 'Social Welfare' },
		],
		recentProjects: [{ name: 'Medical Equipment Drive', amount: '$40,000' }],
	},
	{
		id: 3,
		name: 'Elena Martinez',
		verified: true,
		level: 'Gold Impact Investor',
		levelClass: 'bg-[#FAC118]',
		image:
			'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-B46AKusqD2Kkdwuuqro1ig9ph2nTXH.png',
		totalImpact: '$185,000',
		projectsSupported: 28,
		followers: '720',
		categories: [
			{ icon: 'GraduationCap', name: 'Education' },
			{ icon: 'Paw', name: 'Animal Protection' },
		],
		recentProjects: [{ name: 'School Building Project', amount: '$30,000' }],
	},
]
