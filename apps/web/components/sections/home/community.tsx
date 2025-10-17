'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { BenefitItem } from '~/components/shared/benefits-items'
import { CTAForm } from '~/components/shared/cta-form'
import { SectionContainer } from '~/components/shared/section-container'
import { Testimonial } from '~/components/shared/testimonial-card'
import { benefits, testimonialData } from '~/lib/constants/community-data'
import { useI18n } from '~/lib/i18n'

export function Community() {
	const prefersReducedMotion = useReducedMotion()
	const [formStatus, setFormStatus] = useState<FormStatus | null>(null)
	const { t } = useI18n()

	// Translated benefits
	const translatedBenefits = [
		{ ...benefits[0], text: t('home.benefit1') },
		{ ...benefits[1], text: t('home.benefit2') },
		{ ...benefits[2], text: t('home.benefit3') },
		{ ...benefits[3], text: t('home.benefit4') },
	]

	// Translated testimonial
	const translatedTestimonial = {
		...testimonialData,
		quote: t('home.testimonialQuote'),
		author: t('home.testimonialAuthor'),
		role: t('home.testimonialRole'),
	}

	const handleFormSubmission = async (data: FormData) => {
		setFormStatus(null)
		try {
			// Possibly set a "loading" status and disable form to prevent multiple submissions
			await submitForm(data)
			setFormStatus({
				type: 'success',
				message: 'Form submitted successfully!',
			})
		} catch (error) {
			console.error(error) // Logs the error for debugging
			setFormStatus({
				type: 'error',
				message: 'Failed to submit the form. Please try again.',
			})
		}
	}

	return (
		<section className="py-20">
			<SectionContainer>
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{
						duration: prefersReducedMotion ? 0 : 0.6, // Respects reduced motion preferences
					}}
					className="text-center mb-20 max-w-3xl mx-auto"
				>
					<h2 className="text-4xl font-bold text-gray-900 mb-6">
						<span className="block">{t('home.communityTitle')}</span>
						<span className="block gradient-text">
							{t('home.communitySubtitle')}
						</span>
					</h2>
					<p className="text-lg font-medium text-gray-600 leading-relaxed text-justify">
						{t('home.communityDescription')}
					</p>
				</motion.div>

				{/* Main Content */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
					{/* Benefits List */}
					<div className="container space-y-2">
						{translatedBenefits.map((benefit, index) => (
							<BenefitItem
								key={benefit.id}
								{...benefit}
								isActive={index === 0}
							/>
						))}
					</div>

					{/* Testimonial */}
					<Testimonial {...translatedTestimonial} />
				</div>

				{/* CTA Form */}
				<CTAForm onSubmit={handleFormSubmission} />

				{/* Form Status Message */}
				{formStatus && (
					<div
						className={`mt-4 p-4 rounded-lg ${
							formStatus.type === 'success'
								? 'bg-green-100 text-green-800'
								: 'bg-red-100 text-red-800'
						}`}
					>
						{formStatus.message}
					</div>
				)}
			</SectionContainer>
		</section>
	)
}

const submitForm = async (_data: FormData): Promise<void> => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			if (Math.random() > 0.5) {
				resolve()
			} else {
				reject(new Error('Submission failed'))
			}
		}, 1000)
	})
}

interface FormData {
	name: string
	project: string
}

interface FormStatus {
	type: 'success' | 'error'
	message: string
}
