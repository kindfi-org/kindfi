'use client'

import type { Editor } from '@tiptap/react'
import type React from 'react'
import { useState } from 'react'
import { Button } from '~/components/base/button'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '~/components/base/dialog'
import { Input } from '~/components/base/input'
import { Label } from '~/components/base/label'

interface LinkDialogProps {
	editor: Editor | null
	isOpen: boolean
	onClose: () => void
	initialUrl?: string
	selectedText?: string
}

export function LinkDialog({
	editor,
	isOpen,
	onClose,
	initialUrl = '',
	selectedText = '',
}: LinkDialogProps) {
	const [url, setUrl] = useState(initialUrl)
	const [text, setText] = useState(selectedText)
	const [validationError, setValidationError] = useState('')

	const validateUrl = (input: string) => {
		if (!input) return 'URL is required'
		if (!/^https?:\/\//.test(input)) {
			return 'URL must start with http:// or https://'
		}
		return ''
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		const error = validateUrl(url)
		if (error) {
			setValidationError(error)
			return
		}

		if (editor) {
			if (initialUrl) {
				// Update existing link
				editor
					.chain()
					.focus()
					.extendMarkRange('link')
					.setLink({ href: url })
					.run()
			} else {
				// Create new link
				editor
					.chain()
					.focus()
					.extendMarkRange('link')
					.setLink({ href: url })
					.run()
			}
		}

		onClose()
	}

	const handleRemove = () => {
		if (editor) {
			editor.chain().focus().extendMarkRange('link').unsetLink().run()
		}
		onClose()
	}

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{initialUrl ? 'Edit Link' : 'Insert Link'}</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="url">URL</Label>
							<Input
								id="url"
								value={url}
								onChange={(e) => {
									setUrl(e.target.value)
									setValidationError('')
								}}
								placeholder="https://example.com"
							/>
							{validationError && (
								<p className="text-sm text-red-500">{validationError}</p>
							)}
						</div>
					</div>
					<DialogFooter>
						{initialUrl && (
							<Button
								type="button"
								variant="outline"
								onClick={handleRemove}
								className="mr-auto"
							>
								Remove Link
							</Button>
						)}
						<Button type="button" variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit">Save</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
