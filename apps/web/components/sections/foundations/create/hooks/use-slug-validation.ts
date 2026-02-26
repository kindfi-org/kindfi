import { createSupabaseBrowserClient } from '@packages/lib/supabase-client'
import { startTransition, useEffect, useState } from 'react'
import { useDebounce } from 'react-use'

interface UseSlugValidationResult {
	isChecking: boolean
	isAvailable: boolean | null
	error: string | null
}

export function useSlugValidation(slug: string): UseSlugValidationResult {
	const [isChecking, setIsChecking] = useState(false)
	const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [debouncedSlug, setDebouncedSlug] = useState(slug)
	const supabase = createSupabaseBrowserClient()

	useDebounce(
		() => {
			setDebouncedSlug(slug)
		},
		500,
		[slug],
	)

	useEffect(() => {
		if (!debouncedSlug || debouncedSlug.length < 3) {
			startTransition(() => {
				setIsAvailable(null)
				setError(null)
			})
			return
		}

		startTransition(() => {
			setIsChecking(true)
			setError(null)
		})

		const promise = supabase
			.from('foundations')
			.select('id')
			.eq('slug', debouncedSlug)
			.maybeSingle()

		void Promise.resolve(promise)
			.then(({ data, error: queryError }) => {
				if (queryError) {
					console.error('Error checking slug:', queryError)
					setIsAvailable(null)
					setError(null)
					return
				}

				const available = !data
				setIsAvailable(available)
				setError(
					available
						? null
						: 'This slug is already taken. Please choose another.',
				)
			})
			.catch((err) => {
				console.error('Error checking slug:', err)
				setIsAvailable(null)
				setError(null)
			})
			.finally(() => {
				setIsChecking(false)
			})
	}, [debouncedSlug, supabase])

	return {
		isChecking,
		isAvailable,
		error,
	}
}
