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
import type { ProjectCategory, StatItem } from '~/lib/types'

const Hero = () => {
	const categories: ProjectCategory[] = [
		{
			id: 'empowering-communities-id',
			icon: <Rocket className="w-4 h-4" />,
			label: 'Empowering Communities',
			// Modern & innovative - soft teal
			color:
				'bg-teal-50/80 text-teal-700 hover:bg-teal-100/80 border-teal-200/50',
		},
		{
			id: 'environmental-projects-id',
			icon: <Leaf className="w-4 h-4" />,
			label: 'Environmental Projects',
			// Environmental - soft sage green
			color:
				'bg-green-50/80 text-green-700 hover:bg-green-100/80 border-green-200/50',
		},
		{
			id: 'animal-shelters-id',
			icon: <Heart className="w-4 h-4" />,
			label: 'Animal Shelters',
			// Care & compassion - soft rose
			color:
				'bg-rose-50/80 text-rose-700 hover:bg-rose-100/80 border-rose-200/50',
		},
		{
			id: 'community-news-id',
			icon: <NewspaperIcon className="w-4 h-4" />,
			label: 'Community News Initiatives',
			// Information & trust - soft slate
			color:
				'bg-slate-50/80 text-slate-700 hover:bg-slate-100/80 border-slate-200/50',
		},
	]

	const secondaryCategories = [
		{
			id: 'healthcare-support-id',
			icon: <Stethoscope className="w-4 h-4" />,
			label: 'Healthcare Support',
			// Health - soft cyan
			color: 'border-cyan-200/50 text-cyan-700 hover:bg-cyan-50/80',
		},
		{
			id: 'food-security-id',
			icon: <UtensilsCrossed className="w-4 h-4" />,
			label: 'Food Security Campaigns',
			// Food - soft orange
			color: 'border-orange-200/50 text-orange-700 hover:bg-orange-50/80',
		},
		{
			id: 'child-welfare-id',
			icon: <Baby className="w-4 h-4" />,
			label: 'Child Welfare Programs',
			// Care & nurture - soft purple
			color: 'border-purple-200/50 text-purple-700 hover:bg-purple-50/80',
		},
		{
			id: 'sustainable-agriculture-id',
			icon: <Sprout className="w-4 h-4" />,
			label: 'Sustainable Agriculture',
			// Agriculture - soft emerald
			color: 'border-emerald-200/50 text-emerald-700 hover:bg-emerald-50/80',
		},
		{
			id: 'social-finance-id',
			icon: <Coins className="w-4 h-4" />,
			label: 'Social Finance & Innovation',
			// Finance - soft blue
			color: 'bg-sky-50/80 text-sky-700 hover:bg-sky-100/80 border-sky-200/50',
		},
		{
			id: 'education-for-all-id',
			icon: <GraduationCap className="w-4 h-4" />,
			label: 'Education for All',
			// Education - soft indigo
			color:
				'bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100/80 border-indigo-200/50',
		},
		{
			id: 'disaster-relief-id',
			icon: <HandHelping className="w-4 h-4" />,
			label: 'Disaster Relief Efforts',
			// Disaster Relief - soft red
			color: 'bg-red-50/80 text-red-700 hover:bg-red-100/80 border-red-200/50',
		},
	]

	const stats: StatItem[] = [
		{
			id: 'inversiones-exitosas-id',
			value: '250+',
			label: 'Inversiones Exitosas',
			icon: <LineChart className="w-6 h-6 text-teal-600 mb-2" />,
		},
		{
			id: 'proyectos-financiados-id',
			value: '3,325',
			label: 'Proyectos Financiados',
			icon: <Rocket className="w-6 h-6 text-teal-600 mb-2" />,
		},
		{
			id: 'capital-total-invertido-id',
			value: '$720M',
			label: 'Capital Total Invertido',
			icon: <Coins className="w-6 h-6 text-teal-600 mb-2" />,
			highlight: true,
		},
	]

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
						Revolutionizing Social Impact
					</motion.h2>

					<motion.h1
						className="text-4xl md:text-5xl font-bold gradient-text mb-8 py-4"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
					>
						Support Social Causes Using Web3
					</motion.h1>

					<motion.p
						className="text-lg text-gray-700 pt-2 my-6"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.4 }}
					>
						Every contribution fuels real-world impact. You can support social
						causes through crypto donations to escrows and unlock exclusive
						NFTs. KindFi is driving the adoption of Web3 technology for a more
						connected and empowered world where everyone can make a difference.
					</motion.p>

					{/* CTA Buttons */}
					<motion.div
						className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.6 }}
					>
						<Button size="lg" className="gradient-btn text-white">
							Support with Crypto
						</Button>
						<Button size="lg" variant="outline" className="gradient-border-btn">
							Explore Causes
						</Button>
					</motion.div>

					{/* Primary Categories */}
					<motion.div
						className="flex flex-wrap justify-center gap-3 mb-6"
						variants={staggerChildren}
						initial="initial"
						animate="animate"
					>
						{categories.map((category) => (
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
										{category.icon}
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
						{secondaryCategories.map((category) => (
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
										{category.icon}
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
