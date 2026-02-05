'use client'

import { Building2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '~/components/base/button'

type FormFooterVariant = 'create' | 'edit'

interface FormFooterProps {
	isSubmitting: boolean
	variant?: FormFooterVariant
	cancelHref?: string
}

export function FormFooter({
	isSubmitting,
	variant = 'create',
	cancelHref,
}: FormFooterProps) {
	const router = useRouter()

	const handleCancel = () => {
		if (cancelHref) {
			router.push(cancelHref)
		} else {
			router.back()
		}
	}

	const isEdit = variant === 'edit'

	return (
		<div className="flex flex-col-reverse sm:flex-row gap-4 pt-4 border-t">
			<Button
				type="button"
				variant="outline"
				onClick={handleCancel}
				disabled={isSubmitting}
				className="sm:w-auto focus-visible:ring-2 focus-visible:ring-offset-2"
			>
				Cancel
			</Button>
			<Button
				type="submit"
				disabled={isSubmitting}
				className="flex-1 sm:flex-none sm:min-w-[200px] bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
			>
				{isSubmitting ? (
					<>
						<Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
						{isEdit ? 'Saving…' : 'Creating Foundation…'}
					</>
				) : (
					<>
						<Building2 className="h-4 w-4 mr-2" aria-hidden="true" />
						{isEdit ? 'Save changes' : 'Create Foundation'}
					</>
				)}
			</Button>
		</div>
	)
}
