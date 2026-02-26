import { motion } from 'framer-motion'
import { Card, CardContent } from '~/components/base/card'

interface StepCardProps {
	stepNumber: number
	title: string
	description: string
	Icon: React.ComponentType
	isReversed?: boolean
}

export const StepCard = ({
	stepNumber: _stepNumber,
	title,
	description,
	Icon,
	isReversed = false,
}: StepCardProps) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.6 }}
			className={`flex flex-col ${
				isReversed ? 'md:flex-row-reverse' : 'md:flex-row'
			} gap-8 items-center`}
		>
			{/* Image Card */}
			<div className="w-full md:w-1/2">
				<motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
					<Card className="bg-gradient-to-br from-teal-50 to-white border-none overflow-hidden">
						<CardContent className="p-8">
							<div className="relative">
								{/* Decorative Elements */}
								<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(99, 20, 184, 0.1),transparent)]" />
								<div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

								{/* Icon Container */}
								<div className="relative z-10 flex justify-center items-center">
									<Icon />
								</div>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>

			{/* Content */}
			<div className="w-full md:w-1/2">
				<motion.div
					initial={{ opacity: 0, x: isReversed ? -20 : 20 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, delay: 0.2 }}
				>
					{/* Content */}
					<h3 className="text-2xl font-semibold text-gray-900 mb-4">{title}</h3>
					<p className="text-gray-600 leading-relaxed">{description}</p>
				</motion.div>
			</div>
		</motion.div>
	)
}
