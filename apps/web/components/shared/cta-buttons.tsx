'use client'

import { motion } from 'framer-motion'
import { Button } from '~/components/base/button'

interface CtaButtonsProps {
	primaryText: string
	secondaryText: string
	onPrimaryClick?: () => void
	onSecondaryClick?: () => void
	primaryClassName?: string
	secondaryClassName?: string
	className?: string
}

export const CTAButtons = ({
	primaryText,
	secondaryText,
	onPrimaryClick,
	onSecondaryClick,
	primaryClassName = '',
	secondaryClassName = '',
	className = '',
}: CtaButtonsProps) => {
	return (
		<motion.div
			className={`flex flex-col sm:flex-row justify-center gap-4 ${className}`}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<Button
				size="lg"
				onClick={onPrimaryClick}
				className={`gradient-btn text-white px-8 shadow-sm transition-all duration-300 ${primaryClassName}`}
			>
				{primaryText}
			</Button>
			<Button
				size="lg"
				variant="outline"
				onClick={onSecondaryClick}
				className={`gradient-border-btn transition-all duration-300 ${secondaryClassName}`}
			>
				{secondaryText}
			</Button>
		</motion.div>
	)
}
