import { motion } from 'framer-motion'
import { Icon } from '~/components/base/icon'

interface FloatingFeatureProps {
	icon: string
	title: string
}

const featureVariants = {
	hidden: { opacity: 0, y: 30 },
	show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

/**
 * FloatingFeature - A responsive floating feature component with an icon and title.
 *
 * @component
 * @param {FloatingFeatureProps} props - The component props.
 * @param {string} props.icon - Icon name from the available Lucide icons.
 * @param {string} props.title - The title of the feature.
 * @returns {JSX.Element} The rendered FloatingFeature component.
 */
const FloatingFeature = ({ icon, title }: FloatingFeatureProps) => {
	return (
		<motion.div
			variants={featureVariants}
			whileHover={{ scale: 1.1 }}
			className="flex items-center space-x-4 bg-white px-6 py-3 rounded-full shadow-md border border-gray-200 
					   md:px-4 md:py-2 sm:space-x-2 sm:px-3 sm:py-2 w-full max-w-sm mx-auto"
		>
			<div
				className="flex items-center justify-center w-12 h-12 bg-green-300 text-white rounded-full 
							md:w-10 md:h-10 sm:w-8 sm:h-8"
			>
				<Icon name={icon} className="w-6 h-6 md:w-5 md:h-5 sm:w-4 sm:h-4" />
			</div>
			<span className="text-lg font-medium text-gray-900 md:text-base sm:text-sm">
				{title}
			</span>
		</motion.div>
	)
}

export { FloatingFeature }
