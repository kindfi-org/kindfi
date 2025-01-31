'use client'
import {
	Bookmark,
	Gift,
	Globe,
	Heart,
	Share2,
	Star,
	Trophy,
} from 'lucide-react'
import type React from 'react'
import { useEffect, useState } from 'react'
import { comments, nftCollection, nftTiers } from '../mocks/mock-data'

type ProjectCardProps = {}

const ProjectCard: React.FC<ProjectCardProps> = () => {
	const [showImpact, setShowImpact] = useState(false)
	const [showSuccess, setShowSuccess] = useState(false)

	useEffect(() => {
		let timeoutId: ReturnType<typeof setTimeout>
		if (showImpact) {
			timeoutId = setTimeout(() => {
				setShowSuccess(true)
			}, 3000)
		}
		return () => clearTimeout(timeoutId)
	}, [showImpact])

	const UserAvatar = () => (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			className="w-full h-full p-1 text-gray-400"
		>
			<path
				d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)

	const ProjectView = () => (
		<div className="mb-6">
			<h2 className="text-2xl font-bold mb-2">Project Title</h2>
			<div className="flex items-center gap-4 text-gray-500 mb-4">
				<div className="flex items-center gap-2">
					<span className="text-gray-600">234 supporters</span>
				</div>
				<Share2 className="w-5 h-5" />
				<Bookmark className="w-5 h-5" />
			</div>

			<div className="flex justify-between mb-2">
				<div>
					<div className="text-3xl font-bold">$45,678</div>
					<div className="text-gray-500">raised of $100,000</div>
				</div>
				<div className="text-right">
					<div className="text-3xl font-bold">15</div>
					<div className="text-gray-500">days left</div>
				</div>
			</div>

			<div className="w-full h-2 bg-gray-200 rounded-full mb-6">
				<div className="w-5/12 h-2 bg-blue-500 rounded-full"></div>
			</div>

			<button
				onClick={() => setShowImpact(true)}
				className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium mb-6 flex items-center justify-center gap-2"
			>
				Support this project
			</button>

			<div className="space-y-4">
				<div className="mb-4">
					<div className="flex items-center gap-2 mb-4">
						<Gift className="w-5 h-5 text-purple-500" />
						<span className="font-semibold text-gray-700">NFT Rewards</span>
					</div>
				</div>

				{nftTiers.map((tier, index) => (
					<div key={index} className="p-4 bg-gray-50 rounded-lg">
						<div className="flex justify-between items-center mb-1">
							<h3 className="font-semibold text-gray-700">{tier.title}</h3>
							<span className="bg-purple-100 text-purple-600 px-2 py-1 rounded text-sm">
								{tier.left} left
							</span>
						</div>
						<p className="text-gray-500">{tier.support}</p>
					</div>
				))}

				<div className="flex items-center gap-2 mt-6">
					<div className="w-5 h-5 text-green-500">✓</div>
					<div>
						<div className="font-semibold">Verified Project</div>
						<div className="text-gray-500">
							This project has been verified by KindFi
						</div>
					</div>
				</div>
			</div>
		</div>
	)

	const ImpactView = () => (
		<div>
			<div className="flex justify-between mb-2">
				<div>
					<div className="text-3xl font-bold">$45,678</div>
					<div className="text-gray-500">raised of $100,000</div>
				</div>
				<div className="text-right">
					<div className="text-3xl font-bold">15</div>
					<div className="text-gray-500">days left</div>
				</div>
			</div>

			<div className="w-full h-2 bg-gray-200 rounded-full mb-6">
				<div className="w-5/12 h-2 bg-blue-500 rounded-full"></div>
			</div>

			<div className="flex items-center justify-between mb-6">
				<button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium mr-2">
					Increase Impact
				</button>
				<button className="p-3 border border-gray-200 rounded-lg">
					<Share2 className="w-5 h-5 text-gray-600" />
				</button>
			</div>

			<div className="space-y-6">
				<div>
					<div className="flex items-center gap-2 mb-4">
						<Trophy className="w-5 h-5 text-purple-500" />
						<span className="font-semibold text-gray-700">Your Rewards</span>
					</div>

					<div className="space-y-3">
						<div className="p-4 bg-purple-50 rounded-lg">
							<div className="flex justify-between items-center">
								<h3 className="font-semibold text-gray-700">Early Bird NFT</h3>
								<Star className="w-5 h-5 text-purple-500" />
							</div>
							<p className="text-purple-500">Claimed • #042</p>
						</div>

						<div className="p-4 bg-gray-50 rounded-lg">
							<div className="flex justify-between items-center">
								<h3 className="font-semibold text-gray-700">
									Impact Maker NFT
								</h3>
								<span className="text-gray-500">Locked</span>
							</div>
							<p className="text-gray-500">Support $50 more to unlock</p>
						</div>
					</div>
				</div>

				<div>
					<h3 className="font-semibold text-gray-700 mb-4">
						Your Impact Journey
					</h3>
					<div className="space-y-3">
						<div className="flex justify-between text-gray-600">
							<span>Current Impact</span>
							<span>$100</span>
						</div>
						<div className="flex justify-between text-gray-600">
							<span>Project Rank</span>
							<span>#42 of 234</span>
						</div>
						<div className="flex justify-between text-gray-600">
							<span>Supporting Since</span>
							<span>2 days ago</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	)

	const SuccessView = () => (
		<div className="space-y-4">
			<div className="max-w-md p-6 bg-white rounded-lg shadow">
				<h2 className="text-xl font-semibold mb-4">Your Impact Summary</h2>
				<div className="bg-green-50 p-4 rounded-lg mb-4">
					<div className="flex items-center gap-2 mb-2">
						<Trophy className="w-5 h-5 text-green-600" />
						<span className="text-gray-700 font-semibold">
							Top 10% Supporter
						</span>
					</div>
					<div className="text-3xl font-bold text-green-600 mb-1">$1,000</div>
					<div className="text-green-600">Total Contribution</div>
				</div>
				<div className="grid grid-cols-2 gap-4">
					<div className="bg-purple-50 p-4 rounded-lg text-center">
						<div className="text-2xl font-bold text-purple-600">3</div>
						<div className="text-purple-600">NFTs Earned</div>
					</div>
					<div className="bg-blue-50 p-4 rounded-lg text-center">
						<div className="text-2xl font-bold text-blue-600">5</div>
						<div className="text-blue-600">Referrals</div>
					</div>
				</div>
			</div>

			<div className="max-w-md p-6 bg-white rounded-lg shadow">
				<h2 className="text-xl font-semibold mb-4">Your NFT Collection</h2>
				<div className="space-y-3">
					{nftCollection.map((nft, index) => (
						<div key={index} className="p-4 bg-gray-50 rounded-lg">
							<div className="flex justify-between items-center">
								<div>
									<h3 className="font-semibold text-gray-700">{nft.title}</h3>
									<div className="text-gray-500">{nft.id}</div>
								</div>
								<span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm">
									{nft.rarity}
								</span>
							</div>
						</div>
					))}
				</div>
			</div>

			<div className="max-w-md p-6 bg-white rounded-lg shadow">
				<h2 className="text-xl font-semibold mb-4">Community Impact</h2>
				<div className="flex items-center mb-6">
					{Array(5)
						.fill(0)
						.map((_, i) => (
							<div
								key={i}
								className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white"
								style={{ marginLeft: i > 0 ? '-12px' : '0' }}
							>
								<UserAvatar />
							</div>
						))}
					<span className="text-gray-500 ml-2">+229</span>
				</div>
				<div className="space-y-6">
					{comments.map((comment, index) => (
						<div key={index} className="flex gap-3">
							<div className="w-10 h-10 bg-gray-100 rounded-full flex-shrink-0">
								<UserAvatar />
							</div>
							<div className="flex-1">
								<div className="flex items-center gap-2 mb-1">
									<span className="font-semibold">{comment.name}</span>
									<span className="text-sm text-blue-600">{comment.badge}</span>
								</div>
								<p className="text-gray-600 mb-2">{comment.comment}</p>
								<div className="flex items-center gap-2 text-gray-500">
									<Heart className="w-4 h-4" />
									<span>{comment.likes}</span>
									<button className="text-blue-600">Reply</button>
								</div>
							</div>
						</div>
					))}
					<button className="w-full py-3 bg-blue-50 text-blue-600 rounded-lg">
						Join Success Celebration
					</button>
					<button className="w-full py-3 flex items-center justify-center gap-2 text-gray-600">
						<Globe className="w-4 h-4" />
						View All Comments
					</button>
				</div>
			</div>
		</div>
	)

	// Main render logic
	if (showSuccess) {
		return <SuccessView />
	}

	return (
		<div className="space-y-4">
			<div className="max-w-md p-6 bg-white rounded-lg shadow">
				{showImpact ? <ImpactView /> : <ProjectView />}
			</div>

			{!showImpact && (
				<div className="max-w-md p-6 bg-white rounded-lg shadow">
					<h3 className="text-xl font-semibold mb-4">Project Creator</h3>
					<div className="flex items-center gap-3 mb-4">
						<div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								className="w-6 h-6 text-gray-400"
							>
								<path
									d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<path
									d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</div>
						<div>
							<div className="font-semibold">Creator Name</div>
							<div className="text-gray-500">Joined March 2024</div>
						</div>
					</div>
					<button className="w-full p-3 border border-gray-200 rounded-lg text-gray-700">
						Contact Creator
					</button>
				</div>
			)}
			{showImpact && (
				<div className="max-w-md p-6 bg-white rounded-lg shadow">
					<h3 className="font-semibold text-gray-700 mb-4">
						Fellow Supporters
					</h3>
					<div className="flex items-center">
						{Array(5)
							.fill(0)
							.map((_, i) => (
								<div
									key={i}
									className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white"
									style={{ marginLeft: i > 0 ? '-12px' : '0' }}
								>
									<svg
										viewBox="0 0 24 24"
										fill="none"
										className="w-full h-full p-1 text-gray-400"
									>
										<path
											d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
										<path
											d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								</div>
							))}
						<span className="text-gray-500 ml-2">+42</span>
					</div>
					<button className="w-full p-4 text-gray-600 bg-gray-50 rounded-lg mt-4">
						Join Community Chat
					</button>
				</div>
			)}
		</div>
	)
}

export default ProjectCard
