'use client'

import { Plus, X } from 'lucide-react'
import type React from 'react'
import { useState } from 'react'

import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import { cn } from '~/lib/utils'

interface SocialLinksProps {
	value: string[]
	onChange: (links: string[]) => void
	error?: string
}

export function SocialLinks({ value, onChange, error }: SocialLinksProps) {
	const [newLink, setNewLink] = useState('')
	const [linkError, setLinkError] = useState('')

	const isValidUrl = (url: string): boolean => {
		try {
			new URL(url)
			return true
		} catch {
			return false
		}
	}

	const addLink = () => {
		const trimmed = newLink.trim()

		if (!trimmed) return setLinkError('Please enter a URL')
		if (!isValidUrl(trimmed)) return setLinkError('Please enter a valid URL')
		if (value.includes(trimmed))
			return setLinkError('This URL has already been added')

		onChange([...value, trimmed])
		setNewLink('')
		setLinkError('')
	}

	const removeLink = (linkToRemove: string) => {
		onChange(value.filter((link) => link !== linkToRemove))
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			addLink()
		}
	}

	return (
		<div className="space-y-4">
			<div className="flex gap-2">
				<div className="flex-1">
					<Input
						type="url"
						placeholder="https://example.com"
						value={newLink}
						onChange={(e) => {
							setNewLink(e.target.value)
							if (linkError) setLinkError('')
						}}
						onKeyDown={handleKeyDown}
						className={cn(
							'bg-white',
							linkError
								? 'border-red-500 focus-visible:ring-red-500'
								: 'border-green-600',
						)}
						aria-label="Add social link"
					/>
					{linkError && (
						<p className="mt-1 text-sm text-destructive">{linkError}</p>
					)}
				</div>

				<Button
					type="button"
					onClick={addLink}
					disabled={!newLink.trim()}
					aria-label="Add link"
				>
					<Plus className="h-4 w-4" />
				</Button>
			</div>

			{value.length > 0 && (
				<div className="space-y-2">
					{value.map((link) => (
						<div
							key={link}
							className="flex items-center gap-2 rounded-md bg-gray-50 p-2"
						>
							<span className="flex-1 truncate text-sm">{link}</span>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={() => removeLink(link)}
								aria-label={`Remove link ${link}`}
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
					))}
				</div>
			)}

			{error && <p className="text-sm text-destructive">{error}</p>}
		</div>
	)
}
