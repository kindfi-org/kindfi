'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Loader2, Rocket } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../base/button'
import { Input } from '../base/input'

interface CtaFormProps {
	onSubmit: (data: { name: string; project: string }) => void
	className?: string
}

export const CTAForm = ({ onSubmit, className = '' }: CtaFormProps) => {
	const [formData, setFormData] = useState({ name: '', project: '' })
	const [isLoading, setIsLoading] = useState(false)
	const [isFocused, setIsFocused] = useState({ name: false, project: false })

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

				{/* Form */}
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="flex-1 relative">
							<Input
								placeholder="Your Name"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								onFocus={() => setIsFocused({ ...isFocused, name: true })}
								onBlur={() => setIsFocused({ ...isFocused, name: false })}
								className={`w-full transition-all duration-300 border-gray-200 focus:border-blue-500 ${
									isFocused.name ? 'ring-2 ring-blue-500/20' : ''
								}`}
							/>
							<motion.div
								initial={false}
								animate={{
									scaleX: isFocused.name ? 1 : 0,
									opacity: isFocused.name ? 1 : 0,
								}}
								className="absolute bottom-0 left-0 right-0 h-0.5 origin-left"
							/>
						</div>

						<div className="flex-1 relative">
							<Input
								placeholder="Project Name"
								value={formData.project}
								onChange={(e) =>
									setFormData({ ...formData, project: e.target.value })
								}
								onFocus={() => setIsFocused({ ...isFocused, project: true })}
								onBlur={() => setIsFocused({ ...isFocused, project: false })}
								className={`w-full transition-all duration-300 border-gray-200 focus:border-blue-500 ${
									isFocused.project ? 'ring-2 ring-purple-500/20' : ''
								}`}
							/>
							<motion.div
								initial={false}
								animate={{
									scaleX: isFocused.project ? 1 : 0,
									opacity: isFocused.project ? 1 : 0,
								}}
								className="absolute bottom-0 left-0 right-0 h-0.5 origin-left"
							/>
						</div>

						<Button
							type="submit"
							disabled={isLoading || !formData.name || !formData.project}
							className={`gradient-btn text-white px-8 transition-all duration-300 ${
								isLoading ? 'opacity-80' : ''
							}`}
							aria-label="Start project submission"
						>
							{isLoading ? (
								<Loader2 className="w-5 h-5 animate-spin mr-2" />
							) : (
								<>
									Start Now
									<ArrowRight className="w-5 h-5 ml-2" />
								</>
							)}
						</Button>
					</div>
				</form>

				{/* Footer */}
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.6, delay: 0.2 }}
					className="text-sm text-gray-500 mt-6"
				>
					It takes less than 5 minutes to kick off your journey. Let is turn
					your vision into action and impact.
				</motion.p>
			</div>
		</motion.div>
	)
}
