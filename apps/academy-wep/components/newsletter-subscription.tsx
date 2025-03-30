'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import Link from 'next/link'
import type React from 'react'
import { useEffect, useState } from 'react'
import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'

// Email validation function
const validateEmail = (email: string) => {
	const regex =
		/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

	if (!regex.test(email)) return false

	const parts = email.split('@')
	if (parts[0].length > 64 || parts[1].length > 255) return false

	return true
}

const NewsletterSubscription = () => {
	const [email, setEmail] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')
	const [showToast, setShowToast] = useState(false)
	const [toastMessage, setToastMessage] = useState({
		title: '',
		description: '',
	})

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		setShowToast(false)

		if (!email) {
			setError('Please enter your email address')
			return
		}

		if (!validateEmail(email)) {
			setError('Please enter a valid email address')
			return
		}

		setIsLoading(true)

		try {
			// API call would go here in production

			// Simulating API call with a delay
			await new Promise((resolve) => setTimeout(resolve, 1000))

			setToastMessage({
				title: 'Success!',
				description: "You've been subscribed to the KindFi Academy newsletter.",
			})
			setShowToast(true)
			setEmail('')
		} catch (error) {
			setError('Failed to subscribe. Please try again.')
			console.error('Subscription error:', error)
		} finally {
			setIsLoading(false)
		}
	}

	// Automatically close toast after 3 seconds
	useEffect(() => {
		if (showToast) {
			const timer = setTimeout(() => {
				setShowToast(false)
			}, 3000)

			return () => clearTimeout(timer)
		}
	}, [showToast])

	return (
		<motion.section
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: 'easeOut' }}
			className="rounded-2xl p-8 md:p-12 m-4 md:m-6 xl:m-8 w-full h-fit bg-gradient-to-r from-white via-white to-primary/10"
			style={{ boxShadow: '0 0 15px 5px rgba(0, 0, 0, 0.1)' }}
		>
			<AnimatePresence>
				{showToast && (
					<motion.div
						initial={{ opacity: 0, y: -20, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -20, scale: 0.95 }}
						transition={{ duration: 0.2, ease: 'easeOut' }}
						className="fixed top-4 right-4 bg-white border border-green-200 shadow-lg rounded-lg p-4 max-w-md z-50"
					>
						<div className="flex justify-between items-start">
							<div>
								<h3 className="font-semibold text-primary">
									{toastMessage.title}
								</h3>
								<p className="text-sm text-slate-600">
									{toastMessage.description}
								</p>
							</div>
							<button
								type="button"
								onClick={() => setShowToast(false)}
								className="text-slate-400 hover:text-slate-600"
								aria-label="Close notification"
							>
								<X />
							</button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			<div className="flex flex-col items-center text-center space-y-6">
				<motion.h2
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-black via-black to-primary bg-clip-text text-transparent"
				>
					Stay Updated with New Resources
				</motion.h2>

				<motion.p
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.3 }}
					className="text-slate-700 max-w-[50rem] text-lg font-medium"
				>
					Subscribe to our newsletter to receive the latest articles, guides,
					and updates on blockchain technology for social impact.
				</motion.p>

				<motion.form
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.4 }}
					onSubmit={handleSubmit}
					className="w-full max-w-2xl space-y-4"
				>
					<div className="flex flex-col sm:flex-row gap-3">
						<motion.div
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.4, delay: 0.5 }}
							className="flex-1"
						>
							<Input
								type="email"
								placeholder="Enter your email address"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full rounded-md border-slate-200 text-base focus:border-primary focus:ring-primary px-3 py-4 md:py-6"
								aria-label="Email address"
							/>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, x: 10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.4, delay: 0.6 }}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							<Button
								type="submit"
								disabled={isLoading}
								className="w-full bg-gradient-to-r from-primary to-black  text-white text-base font-medium p-6"
							>
								{isLoading ? (
									<>
										<span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
										Subscribing...
									</>
								) : (
									'Subscribe Now'
								)}
							</Button>
						</motion.div>
					</div>

					<AnimatePresence>
						{error && (
							<motion.p
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: 'auto' }}
								exit={{ opacity: 0, height: 0 }}
								transition={{ duration: 0.2 }}
								className="text-red-500 text-sm mt-1 "
								aria-live="polite"
							>
								{error}
							</motion.p>
						)}
					</AnimatePresence>

					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5, delay: 0.7 }}
						className="text-sm text-slate-500 mt-3"
					>
						By subscribing, you agree to our{' '}
						<Link
							href="/privacy-policy"
							className="text-green-700 hover:underline"
						>
							Privacy Policy
						</Link>{' '}
						and consent to receive updates from KindFi Academy.
					</motion.p>
				</motion.form>
			</div>
		</motion.section>
	)
}

export { NewsletterSubscription }
