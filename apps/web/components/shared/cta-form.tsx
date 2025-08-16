'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Loader2, Rocket } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../base/button'
import { Input } from '../base/input'
import { WaitlistModal } from '~/components/sections/waitlist/waitlist-modal'

interface CtaFormProps {
	onSubmit: (data: { name: string; project: string }) => void
	className?: string
}

export const CTAForm = ({ onSubmit, className = '' }: CtaFormProps) => {
	const [formData, setFormData] = useState({ name: '', project: '' })
	const [isLoading, setIsLoading] = useState(false)
	const [isFocused, setIsFocused] = useState({ name: false, project: false })
	const [waitlistOpen, setWaitlistOpen] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)

		try {
			await onSubmit(formData)
			// Optional: Add success feedback
		} catch (_error) {
			// Optional: Add error handling
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6 }}
			className={`relative ${className}`}
		>
			<div className="text-center max-w-2xl mx-auto">
				{/* Icon */}
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ duration: 0.5 }}
					className="mx-auto w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-6"
				>
					<Rocket className="w-6 h-6 text-purple-600" />
				</motion.div>

				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.1 }}
				>
					<h2 className="text-3xl font-bold text-gray-900 mb-4">
						Launch Your Social Cause with KindFi
					</h2>
					<p className="text-lg text-gray-600 mb-8">
						Whether you’re an NGO, local initiative, or changemaker — start your
						journey in minutes. Our Web3-powered platform gives your project
						visibility, trust, and a path to real funding
					</p>
				</motion.div>
				<div className="flex-1 flex-col sm:flex-row gap-4">
					<Button
						type="button"
						variant="primary-gradient"
						onClick={() => setWaitlistOpen(true)}
						aria-label="Open waitlist"
						className="w-full sm:w-72"
					>
						Join the waitlist
					</Button>
					<WaitlistModal open={waitlistOpen} onOpenChange={setWaitlistOpen} />
				</div>
			</div>
		</motion.div>
	)
}
