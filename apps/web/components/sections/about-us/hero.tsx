'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { Image } from '~/components/base/image'
import { mockAboutUs } from '~/lib/mock-data/mock-about-us'

const Hero = () => {
	const { hero } = mockAboutUs

	return (
		<motion.section
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: 'easeOut' }}
			className="relative flex flex-col-reverse lg:flex-row items-center justify-between gap-10 px-6 lg:px-20 py-16 lg:py-24"
		>
			<motion.div
				initial={{ opacity: 0, x: -30 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
				className="max-w-2xl text-center lg:text-left space-y-6"
			>
				<Badge variant="outline" className="text-sm px-4 py-1.5 rounded-full">
					{hero.badge}
				</Badge>

				<h1 className="text-5xl lg:text-7xl font-bold text-black leading-[1.3] max-w-[22ch] whitespace-pre-line">
					{hero.headline}
				</h1>

				<p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
					{hero.subheading}
				</p>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, ease: 'easeOut', delay: 0.4 }}
					className="flex flex-col sm:flex-row gap-4 mt-6"
				>
					<Button
						variant="default"
						className="bg-black text-white px-6 py-2 text-base flex items-center justify-center gap-2 rounded-md"
					>
						{hero.ctas[0].label}
						<ArrowRight
							size={28}
							strokeWidth={2.5}
							className="relative top-[1px] shrink-0"
						/>
					</Button>
					<Button
						variant="outline"
						className="px-6 py-3 text-base border rounded-md"
					>
						{hero.ctas[1].label}
					</Button>
				</motion.div>
			</motion.div>

			<motion.div
				initial={{ opacity: 0, x: 50 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
				className="w-full flex justify-center"
			>
				<div className="w-full max-w-[620px] lg:max-w-[720px] aspect-[7/5]">
					<Image
						src={hero.image}
						alt="Blockchain and Crowdfunding Visual"
						width={720}
						height={500}
						className="rounded-lg shadow-md w-full h-full object-cover"
					/>
				</div>
			</motion.div>
		</motion.section>
	)
}

export { Hero }
