'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, ChevronRight, Megaphone, RefreshCw } from 'lucide-react'
import { Button } from '~/components/base/button'
import { SectionCaption } from '~/components/shared/section-caption'

export const WhyInvestSection = () => {
	const features = [
		{
			icon: (
				<div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center relative overflow-hidden group-hover:bg-teal-100 transition-colors duration-300">
					<motion.div
						initial={{ rotate: 0 }}
						animate={{ rotate: 360 }}
						transition={{
							duration: 20,
							repeat: Number.POSITIVE_INFINITY,
							ease: 'linear',
						}}
						className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(20,184,166,0.1),transparent)]"
					/>
					<ArrowUpRight className="w-8 h-8 text-teal-600 relative z-10" />
				</div>
			),
			title: 'Collaborate and Earn Rewards',
			description:
				'Every contribution brings us closer to real change and meaningful rewards. Receive exclusive benefits like limited-edition NFTs, access to special events, and more. Collaboration has never been this rewarding.',
			highlight: 'Community Rewards',
		},
		{
			icon: (
				<div className="w-16 h-16 rounded-full bg-sky-50 flex items-center justify-center relative overflow-hidden group-hover:bg-sky-100 transition-colors duration-300">
					<motion.div
						initial={{ rotate: 0 }}
						animate={{ rotate: -360 }}
						transition={{
							duration: 20,
							repeat: Number.POSITIVE_INFINITY,
							ease: 'linear',
						}}
						className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(14,165,233,0.1),transparent)]"
					/>
					<RefreshCw className="w-8 h-8 text-sky-600 relative z-10" />
				</div>
			),
			title: 'Build a Better World',
			description:
				'Support a diverse range of social initiatives, from animal welfare to cultural preservation. Diversify your contributions and become a driving force for global change.',
			highlight: '+50 Social Initiatives',
		},
		{
			icon: (
				<div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center relative overflow-hidden group-hover:bg-purple-100 transition-colors duration-300">
					<motion.div
						initial={{ rotate: 0 }}
						animate={{ rotate: 360 }}
						transition={{
							duration: 20,
							repeat: Number.POSITIVE_INFINITY,
							ease: 'linear',
						}}
						className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(89, 16, 185, 0.1),transparent)]"
					/>
					<Megaphone className="w-8 h-8 text-purple-600 relative z-10" />
				</div>
			),
			title: 'Be the Revolution',
			description:
				'Raise the flag and prove that Web3 is the future of social impact. By empowering causes through decentralized technology, you can create real, lasting change beyond the limits of traditional systems.',
			highlight: 'Web3 Revolution Advocate',
		},
	]

	return (
		<section className="relative py-24 overflow-hidden">
			{/* Background */}
			<div className="absolute inset-0">
				<div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
			</div>

			<div className="relative container mx-auto px-4">
				{/* Section Caption */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
				>
					<SectionCaption
						title="Join the KindFi Revolution: Collaborate and Transform the World with Web3"
						subtitle="The Web3 community has the power to give back. Support causes that matter, collaborate on impactful projects, and be part of a revolution leveraging Web3 technology to improve lives. Together, we can create lasting and meaningful change."
						highlightWords={['Transform the World with Web3', 'KindFi']}
					/>
				</motion.div>

				{/* Feature Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-16">
					{features.map((feature, index) => (
						<motion.div
							key={`feature-${feature.title}`}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: index * 0.1 }}
						>
							<div className="group h-full bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300">
								{/* Icon */}
								{feature.icon}

								{/* Content */}
								<h3 className="mt-6 text-xl font-semibold text-gray-900">
									{feature.title}
								</h3>
								<p className="mt-4 text-gray-600 leading-relaxed">
									{feature.description}
								</p>

								{/* Highlight */}
								<div className="mt-6 flex items-center text-sm font-medium text-blue-600">
									{feature.highlight}
									<ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
								</div>
							</div>
						</motion.div>
					))}
				</div>

				{/* Call-to-Action Box */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, delay: 0.3 }}
					className="relative bg-white rounded-2xl p-8 lg:p-12 shadow-lg max-w-3xl mx-auto overflow-hidden"
				>
					{/* Background Pattern */}
					<div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-sky-50 opacity-50" />

					<div className="relative">
						<h4 className="text-xl font-semibold text-center text-gray-900 mb-4">
							KindFi: One Better World
						</h4>
						<p className="text-gray-600 mb-8 leading-relaxed">
							At KindFi, you’re part of a movement demonstrating that Web3 is
							reshaping the future of social impact. From saving the planet to
							empowering communities, every contribution makes a difference. Now
							is the time to use decentralized power to drive true change. Join
							us in making a real impact, free from the limitations of
							traditional systems.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button size="lg" className="gradient-btn text-white px-8">
								Join the Revolution
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="gradient-border-btn hover:bg-teal-50"
							>
								Discover more about KindFi
							</Button>
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	)
}
