'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, Rocket, Users } from 'lucide-react'
import React from 'react'
import { Button } from '~/components/base/button'
import { cn } from '~/lib/utils'

const ProjectJourney = () => {
	const [activeView, setActiveView] = React.useState<'project' | 'investor'>(
		'project',
	)

	const projectSteps = [
		{
			number: 1,
			title: 'Project Registration',
			description:
				'Share the key details of your idea and set clear fundraising goals to kickstart your campaign.',
			active: true,
			icon: <Rocket className="w-5 h-5" />,
		},
		{
			number: 2,
			title: 'Review and Approval',
			description:
				'Our team evaluates the feasibility of your proposal to ensure transparency and maximize its potential for success.',
			active: false,
			icon: <ChevronRight className="w-5 h-5" />,
		},
		{
			number: 3,
			title: 'Campaign Preparation',
			description:
				'Refine and optimize your campaign to make it ready for an impactful launch on the platform.',
			active: false,
			icon: <ChevronRight className="w-5 h-5" />,
		},
		{
			number: 4,
			title: 'Launch and Promotion',
			description:
				'Bring your project to life by launching it for investors and start collecting contributions.',
			active: false,
			icon: <ChevronRight className="w-5 h-5" />,
		},
		{
			number: 5,
			title: 'Fund Reception',
			description:
				'Once your goal is reached, withdraw your funds and begin building your vision for the future.',
			active: false,
			icon: <ChevronRight className="w-5 h-5" />,
		},
	]

	const investorSteps = [
		{
			number: 1,
			title: 'Explore Projects',
			description:
				'Browse a diverse range of projects aligned with your interests and values, and discover opportunities to make an impact.',
			active: true,
			icon: <Users className="w-5 h-5" />,
		},
		{
			number: 2,
			title: 'Analyze Project Details',
			description:
				'Access key information about each project, including objectives, progress, and potential impact.',
			active: false,
			icon: <ChevronRight className="w-5 h-5" />,
		},
		{
			number: 3,
			title: 'Contribute to Projects',
			description:
				'Choose the projects that resonate with you the most and make your contribution with ease.',
			active: false,
			icon: <ChevronRight className="w-5 h-5" />,
		},
		{
			number: 4,
			title: 'Real-Time Tracking',
			description:
				'Monitor project progress in real-time and receive regular updates on milestones and achievements.',
			active: false,
			icon: <ChevronRight className="w-5 h-5" />,
		},
		{
			number: 5,
			title: 'Rewards and Engagement',
			description:
				'Receive exclusive rewards like NFTs, tokens, or access to special activities as the projects you supported reach completion.',
			active: false,
			icon: <ChevronRight className="w-5 h-5" />,
		},
	]

	const steps = activeView === 'project' ? projectSteps : investorSteps

	return (
		<section className="gradient-bg-blue-purple relative overflow-hidden px-4 py-14">
			{/* Background Pattern */}
			<div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

			<div className="relative mx-auto max-w-7xl">
				{/* Header */}
				<div className="text-center mb-16">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						<h2 className="text-4xl font-bold text-gray-900 mb-4">
							Transform Realities Using the{' '}
							<span className="gradient-text">Power of the Web3</span>
						</h2>
						<p className="text-gray-600 max-w-2xl mx-auto text-lg">
							From creation to launch, follow a transparent and secure process
							powered by Smart Blockchain Escrows. Every step is verified to
							ensure the success of your social campaign.
						</p>
					</motion.div>

					{/* Toggle Buttons */}
					<motion.div
						className="mt-12 mb-16 flex justify-center"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
					>
						<div className="inline-flex rounded-full p-1 bg-white shadow-sm border border-gray-100">
							<Button
								variant={activeView === 'project' ? 'default' : 'ghost'}
								aria-label="Switch to Social Cause Project Journey"
								className={cn(
									'rounded-full px-6 py-2 text-sm font-medium transition-all duration-200',
									{
										'gradient-btn text-white': activeView === 'project',
										'text-gray-600 hover:text-emerald-600':
											activeView !== 'project',
									},
								)}
								onClick={() => setActiveView('project')}
							>
								Social Cause Path
							</Button>
							<Button
								variant={activeView === 'investor' ? 'default' : 'ghost'}
								aria-label="Switch to Supporter Investment Journey"
								className={cn(
									'rounded-full px-6 py-2 text-sm font-medium transition-all duration-200',
									{
										'gradient-btn text-white': activeView === 'investor',
										'text-gray-600 hover:text-emerald-600':
											activeView !== 'investor',
									},
								)}
								onClick={() => setActiveView('investor')}
							>
								Supporter Path
							</Button>
						</div>
					</motion.div>
				</div>

				{/* Steps */}
				<AnimatePresence mode="wait">
					<motion.div
						key={activeView}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.5 }}
						className="grid gap-8 md:gap-4 md:grid-cols-5"
					>
						{steps.map((step, index) => (
							<motion.div
								key={`step-${step.number}`}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: index * 0.1 }}
							>
								<div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 h-full border border-gray-100">
									<div className="flex items-center mb-4">
										<div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-purple-600 font-semibold text-sm">
											{step.number}
										</div>
										<div className="ml-3 font-semibold text-gray-900">
											{step.title}
										</div>
									</div>
									<p className="text-gray-600 text-sm leading-relaxed">
										{step.description}
									</p>
								</div>
							</motion.div>
						))}
					</motion.div>
				</AnimatePresence>

				{/* Action Button */}
				<motion.div
					className="mt-12 text-center"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.8 }}
				>
					<Button
						size="lg"
						aria-label={
							activeView === 'project'
								? 'Register Your Social Project'
								: 'Explore Social Causes'
						}
						className="bg-indigo-900 hover:bg-indigo-800 text-white px-8"
					>
						{activeView === 'project'
							? 'Register Your Project'
							: 'Explore Causes'}
					</Button>
				</motion.div>
			</div>
		</section>
	)
}

export default ProjectJourney
