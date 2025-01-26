'use client'
import { AlertCircle } from 'lucide-react'
import React from 'react'
import { Button } from '~/components/base/button'

interface ErrorFallbackProps {
	title?: string
	message?: string
	actionText?: string
	onAction?: () => void
}

export function ErrorFallback({
	title = 'An error occurred',
	message = 'Please try again or contact support if the problem persists.',
	actionText = 'Try Again',
	onAction = () => window.location.reload(),
}: ErrorFallbackProps) {
	return (
		<div role="alert" className="p-4 text-center">
			<div className="mb-4 text-red-600">
				<AlertCircle
					className="mx-auto"
					size={40}
					color="red"
					strokeWidth={2}
				/>
			</div>
			<h2 className="text-xl font-semibold mb-2 text-gray-800">{title}</h2>
			<p className="mb-4 text-gray-600">{message}</p>
			<Button
				onClick={onAction}
				className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
			>
				{actionText}
			</Button>
		</div>
	)
}
