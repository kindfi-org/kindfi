'use client'

import { motion } from 'framer-motion'
import {
	Baby,
	Coins,
	GraduationCap,
	HandHelping,
	Heart,
	Leaf,
	LineChart,
	NewspaperIcon,
	Rocket,
	Sprout,
	Stethoscope,
	UtensilsCrossed,
} from 'lucide-react'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { heroContent } from '~/constants/sections/hero'

const iconComponents = {
	Rocket: <Rocket className="w-4 h-4" />,
	Leaf: <Leaf className="w-4 h-4" />,
	Heart: <Heart className="w-4 h-4" />,
	NewspaperIcon: <NewspaperIcon className="w-4 h-4" />,
	Stethoscope: <Stethoscope className="w-4 h-4" />,
	UtensilsCrossed: <UtensilsCrossed className="w-4 h-4" />,
	Baby: <Baby className="w-4 h-4" />,
	Sprout: <Sprout className="w-4 h-4" />,
	Coins: <Coins className="w-4 h-4" />,
	GraduationCap: <GraduationCap className="w-4 h-4" />,
	HandHelping: <HandHelping className="w-4 h-4" />,
	LineChart: <LineChart className="w-4 h-4" />,
}

const Hero = () => {
	const fadeInUp = {
		initial: { opacity: 0, y: 20 },
		animate: { opacity: 1, y: 0 },
		transition: { duration: 0.5 },
	}

	const staggerChildren = {
		animate: { transition: { staggerChildren: 0.1 } },
	}

	const badgeVariants = {
		initial: { opacity: 0, y: 20 },
		animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
		hover: { scale: 1.05, transition: { duration: 0.2 } },
		tap: { scale: 0.95 },
	}

	return (
		<section className="relative z-0 min-h-[80vh] bg-gradient-to-b from-purple-50/50 to-white px-4 py-20">
			<div className="container mx-auto max-w-6xl">
				{/* Main Content */}
				<div className="text-center">
					<motion.h2
						className="text-2xl font-bold text-gray-800 mb-6"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						{heroContent.title}
					</motion.h2>

					<motion.h1
						className="text-4xl md:text-5xl font-bold gradient-text mb-8 py-4"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
					>
						{heroContent.subtitle}
					</motion.h1>

					<motion.p
						className="text-lg text-gray-700 pt-2 my-6"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.4 }}
					>
						{heroContent.description}
					</motion.p>

					{/* CTA Buttons */}
					<motion.div
						className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.6 }}
					>
						<Button size="lg" className="gradient-btn text-white">
							{heroContent.cta.primary}
						</Button>
						<Button size="lg" variant="outline" className="gradient-border-btn">
							{heroContent.cta.secondary}
						</Button>
					</motion.div>

					{/* Primary Categories */}
					<motion.div
						className="flex flex-wrap justify-center gap-3 mb-6"
						variants={staggerChildren}
						initial="initial"
						animate="animate"
					>
						{heroContent.categories.map((category) => (
							<motion.div
								key={category.id}
								variants={badgeVariants}
								whileHover="hover"
								whileTap="tap"
								className="relative"
							>
								<Badge
									variant="secondary"
									className={`px-4 py-2 cursor-pointer transition-all duration-300 ${category.color}`}
								>
									<motion.span
										className="mr-2"
										animate={{ rotate: [0, 5, -5, 0] }}
										transition={{
											duration: 2,
											repeat: Number.POSITIVE_INFINITY,
											ease: 'easeInOut',
										}}
									>
										{iconComponents[category.icon]}
									</motion.span>
									{category.label}
								</Badge>
							</motion.div>
						))}
					</motion.div>

					{/* Secondary Categories */}
					<motion.div
						className="flex flex-wrap justify-center gap-3 mb-16"
						variants={staggerChildren}
						initial="initial"
						animate="animate"
					>
						{heroContent.secondaryCategories.map((category) => (
							<motion.div
								key={category.id}
								variants={badgeVariants}
								whileHover="hover"
								whileTap="tap"
								className="relative"
							>
								<Badge
									variant="outline"
									className={`px-4 py-2 cursor-pointer transition-all duration-300 ${category.color}`}
								>
									<motion.span
										className="mr-2"
										animate={{ rotate: [0, 5, -5, 0] }}
										transition={{
											duration: 2,
											repeat: Number.POSITIVE_INFINITY,
											ease: 'easeInOut',
										}}
									>
										{iconComponents[category.icon]}
									</motion.span>
									{category.label}
								</Badge>
							</motion.div>
						))}
					</motion.div>

					{/* Stats */}
					{/* <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            {stats.map((stat) => (
              <div
                key={stat.id}
                className="flex flex-col items-center rounded-lg bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md"
              >
                {stat.icon}
                <div
                  className={`text-3xl font-bold ${stat.highlight ? "text-teal-600" : "text-gray-900"}`}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </motion.div> */}
				</div>
			</div>
		</section>
	)
}

export default Hero
