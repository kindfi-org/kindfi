'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '~/components/base/button'
import { cn } from '~/lib/utils'

interface CtaButtonsProps {
	primaryText: string
	secondaryText: string
	primaryHref?: string
	secondaryHref?: string
	onPrimaryClick?: () => void
	onSecondaryClick?: () => void
	primaryClassName?: string
	secondaryClassName?: string
	className?: string
	disabled?: boolean
	animationDelay?: number
}

export const CTAButtons = ({
	primaryText,
	secondaryText,
	primaryHref = '/create-project',
	secondaryHref = '/projects',
	onPrimaryClick,
	onSecondaryClick,
	primaryClassName = '',
	secondaryClassName = '',
	className = '',
	disabled = false,
	animationDelay = 0,
}: CtaButtonsProps) => {
	const renderPrimaryButton = () => (
		<Button
			size="lg"
			onClick={onPrimaryClick}
			className={cn(
				'gradient-btn text-white px-8 shadow-sm transition-all duration-300 hover:shadow-md',
				disabled && 'opacity-70 cursor-not-allowed',
				primaryClassName,
			)}
			disabled={disabled}
			asChild={!!primaryHref && !disabled}
			aria-label={
				typeof primaryText === 'string' ? primaryText : 'Primary action'
			}
		>
			{primaryHref && !disabled ? (
				<Link href={primaryHref}>{primaryText}</Link>
			) : (
				primaryText
			)}
		</Button>
	)

	const renderSecondaryButton = () => (
		<Button
			size="lg"
			variant="outline"
			onClick={onSecondaryClick}
			className={cn(
				'gradient-border-btn transition-all duration-300 hover:bg-gray-50',
				disabled && 'opacity-70 cursor-not-allowed',
				secondaryClassName,
			)}
			disabled={disabled}
			asChild={!!secondaryHref && !disabled}
			aria-label={
				typeof secondaryText === 'string' ? secondaryText : 'Secondary action'
			}
		>
			{secondaryHref && !disabled ? (
				<Link href={secondaryHref}>{secondaryText}</Link>
			) : (
				secondaryText
			)}
		</Button>
	)

	return (
		<motion.div
			className={cn(
				'flex flex-col sm:flex-row justify-center gap-4',
				className,
			)}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: animationDelay }}
		>
			{renderPrimaryButton()}
			{renderSecondaryButton()}
		</motion.div>
	)
}
