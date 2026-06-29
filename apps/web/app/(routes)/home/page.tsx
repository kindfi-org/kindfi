import type { Metadata } from 'next'
import { Suspense } from 'react'
import { HomeDashboard } from '~/components/pages/home'
import { HighlightedProjectsHydration } from '~/components/sections/home/highlighted-projects-hydration'
import { SkeletonHighlightedProjects } from '~/components/sections/home/skeletons'

export const metadata: Metadata = {
	title: 'KindFi — Web3 Crowdfunding for Social Impact',
	description:
		'KindFi is the first blockchain-powered crowdfunding platform connecting donors with impactful social and environmental causes. Milestone-based funding on Stellar ensures transparency and accountability.',
	keywords: [
		'crypto crowdfunding',
		'social impact',
		'blockchain donations',
		'Stellar network',
		'Web3 philanthropy',
		'NGO funding',
		'transparent crowdfunding',
		'decentralized fundraising',
	],
	openGraph: {
		title: 'KindFi — Web3 Crowdfunding for Social Impact',
		description:
			'The first blockchain-powered crowdfunding platform connecting donors with impactful causes. Milestone-based escrow on Stellar guarantees your donation creates real change.',
		type: 'website',
		url: '/',
		images: [
			{
				url: '/images/og-home.png',
				width: 1200,
				height: 630,
				alt: 'KindFi — Web3 Crowdfunding for Social Impact',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'KindFi — Web3 Crowdfunding for Social Impact',
		description:
			'The first blockchain-powered crowdfunding platform for social and environmental causes. Built on Stellar.',
		images: ['/images/og-home.png'],
	},
	alternates: {
		canonical: '/',
	},
}

export default function HomePage() {
	return (
		<>
			<HomeDashboard />
			<Suspense fallback={<SkeletonHighlightedProjects />}>
				<HighlightedProjectsHydration />
			</Suspense>
		</>
	)
}
