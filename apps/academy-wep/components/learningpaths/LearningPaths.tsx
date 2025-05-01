import { ArrowRight } from 'lucide-react'
import React from 'react'
import { LearningPathsCard } from './LearningPathCard'

const LearningPaths = () => {
	return (
		<div className="bg-white lg:p-14 p-8">
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
				<div>
					<div className="px-3 py-1 bg-[#f0f9e8] text-[#7CC635] rounded-full text-sm font-medium mb-4 w-fit">
						<span>Learning Paths</span>
					</div>
					<h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-gray-900 via-gray-800 to-[#7CC635] bg-clip-text text-transparent">
						Choose Your Learning Journey
					</h2>
				</div>
				<button
					type="button"
					className="w-fit flex gap-2 justify-center items-center px-4 py-2 border-2 border-gray-400 rounded-md"
				>
					<h1>View All Paths</h1>
					<ArrowRight className="h-4" />
				</button>
			</div>
			<div className="flex lg:flex-row flex-col gap-6">
				<LearningPathsCard
					icon="table2"
					title="Blockchain Fundamentals"
					description="Master the core concepts of blockchain technology and understand how it enables transparent, secure transactions."
					modules={6}
					level="Beginner"
					duration="4 weeks"
					cta="/learn/blockchain-fundamentals"
					ctaColor="green"
				/>
				<LearningPathsCard
					icon="zap"
					title="Impact Crowfunding"
					description="Discover strategies for creating successful crowdfunding campaigns that leverage blockchain for transparency and trust."
					modules={5}
					level="All Levels"
					duration="3 weeks"
					ctaColor="blue"
					cta="/learn/impact-crowdfunding"
				/>
			</div>
		</div>
	)
}

export default LearningPaths
