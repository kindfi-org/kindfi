'use client'

import { motion } from 'framer-motion'
import React from 'react'
import {
	FeatureCreatorCard,
	type FeatureCreatorCardProps,
} from '~/components/shared/feature-creator-card'

interface FeatureCreatorsProps {
	creators: FeatureCreatorCardProps[]
}

export const FeaturedCreators = ({ creators }: FeatureCreatorsProps) => {
	return (
		<section className="py-12 bg-gray-100">
			<div className="container mx-auto text-center">
				<motion.h2
					className="text-3xl font-bold text-gray-800 mb-6"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					Featured Creators
				</motion.h2>
				<motion.p
					className="text-lg text-gray-700 pt-2 my-6"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.4 }}
				>
					Meet our most successful and trusted project creators making real
					change happen.
				</motion.p>
				<div className="flex flex-wrap justify-center gap-8 mt-14">
					{creators.length === 0 ? (
						<p>No creators found</p>
					) : (
						<>
							{creators.map((creator) => (
								<FeatureCreatorCard key={creator.name} {...creator} />
							))}
						</>
					)}
				</div>
			</div>
		</section>
	)
}
