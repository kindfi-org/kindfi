'use client'

import { motion } from 'framer-motion'
import { Rocket, Shield, TrendingUp, Users } from 'lucide-react'
import { BenefitItem } from '~/components/shared/benefits-items'
import { CTAForm } from '~/components/shared/cta-form'
import { Testimonial } from '~/components/shared/testimonial-card'
import { communityContent } from '~/constants/sections/community'

const iconComponents = {
	Users: <Users className="w-5 h-5" />,
	TrendingUp: <TrendingUp className="w-5 h-5" />,
	Shield: <Shield className="w-5 h-5" />,
	Rocket: <Rocket className="w-5 h-5" />,
}

const CommunitySection = () => {
	return (
		<section className="py-20">
			<div className="container mx-auto px-4">
				{/* Header */}
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="text-center mb-20 max-w-3xl mx-auto"
				>
					<h2 className="text-4xl font-bold text-gray-900 mb-6">
						<span className="block">{communityContent.title.main}</span>
						<span className="block gradient-text">
							{communityContent.title.highlight}
						</span>
					</h2>
					<p className="text-lg font-medium text-gray-600 leading-relaxed text-justify">
						{communityContent.description}
					</p>
				</motion.div>

				{/* Main Content */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
					{/* Benefits List */}
					<div className="container space-y-2">
						{communityContent.benefits.map((benefit, index) => (
							<BenefitItem
								key={benefit.id}
								{...benefit}
								icon={iconComponents[benefit.icon]}
								isActive={index === 0}
							/>
						))}
					</div>

					{/* Testimonial */}
					<Testimonial {...communityContent.testimonial} />
				</div>

				{/* CTA Form */}
				<CTAForm onSubmit={(data) => console.log(data)} />
			</div>
		</section>
	)
}

export default CommunitySection
