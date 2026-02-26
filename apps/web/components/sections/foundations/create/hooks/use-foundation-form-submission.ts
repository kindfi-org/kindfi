import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import type { CreateFoundationFormData } from '../types'

export function useFoundationFormSubmission() {
	const router = useRouter()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const submitFoundation = async (data: CreateFoundationFormData) => {
		setIsSubmitting(true)

		try {
			const formDataToSubmit = new FormData()
			formDataToSubmit.append('name', data.name)
			formDataToSubmit.append('description', data.description)
			formDataToSubmit.append('slug', data.slug)
			formDataToSubmit.append('foundedYear', String(data.foundedYear))
			if (data.mission) formDataToSubmit.append('mission', data.mission)
			if (data.vision) formDataToSubmit.append('vision', data.vision)
			if (data.websiteUrl)
				formDataToSubmit.append('websiteUrl', data.websiteUrl)
			if (data.socialLinks && Object.keys(data.socialLinks).length > 0) {
				formDataToSubmit.append('socialLinks', JSON.stringify(data.socialLinks))
			}
			if (data.logo instanceof File) {
				formDataToSubmit.append('logo', data.logo)
			}

			const response = await fetch('/api/foundations/create', {
				method: 'POST',
				body: formDataToSubmit,
			})

			const result = await response.json()

			if (!response.ok) {
				// Handle slug conflict specifically
				if (result.error === 'Slug already exists') {
					throw new Error(
						'This foundation URL is already taken. Please choose a different slug.',
					)
				}
				throw new Error(result.error || 'Failed to create foundation')
			}

			toast.success('Foundation created successfully!')
			router.push(`/foundations/${result.slug}`)
		} catch (error) {
			console.error('Error creating foundation:', error)
			toast.error(
				error instanceof Error
					? error.message
					: 'Failed to create foundation. Please try again.',
			)
			throw error
		} finally {
			setIsSubmitting(false)
		}
	}

	return { submitFoundation, isSubmitting }
}
