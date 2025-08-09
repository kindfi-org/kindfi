'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { Editor } from '@tiptap/react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '~/components/base/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '~/components/base/dialog'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/base/form'
import { Input } from '~/components/base/input'
import { cn } from '~/lib/utils'

const linkSchema = z.object({
	url: z
		.string()
		.trim()
		.url('Please enter a valid URL (e.g., https://example.com)')
		.refine((u) => u.startsWith('https://'), { message: 'URL must use HTTPS' }),
	text: z.string().optional(),
})

type LinkFormValues = z.infer<typeof linkSchema>

interface LinkDialogProps {
	editor: Editor | null
	isOpen: boolean
	onClose: () => void
	initialUrl?: string
	selectedText?: string
	className?: string
}

export function LinkDialog({
	editor,
	isOpen,
	onClose,
	initialUrl = '',
	selectedText = '',
	className,
}: LinkDialogProps) {
	const form = useForm<LinkFormValues>({
		resolver: zodResolver(linkSchema),
		defaultValues: {
			url: initialUrl,
			text: selectedText,
		},
	})

	useEffect(() => {
		if (isOpen) {
			form.reset({
				url: initialUrl,
				text: selectedText,
			})
		}
	}, [isOpen, initialUrl, selectedText, form])

	const onSubmit = (values: LinkFormValues) => {
		if (!editor) return

		const { empty } = editor.state.selection
		const safeText = values.text?.trim() || values.url

		if (empty) {
			editor
				.chain()
				.focus()
				.insertContent({
					type: 'text',
					text: safeText,
					marks: [
						{
							type: 'link',
							attrs: {
								href: values.url,
								target: '_blank',
								rel: 'noopener noreferrer nofollow',
							},
						},
					],
				})
				.run()
		} else {
			editor
				.chain()
				.focus()
				.extendMarkRange('link')
				.setLink({
					href: values.url,
					target: '_blank',
					rel: 'noopener noreferrer nofollow',
				})
				.run()
		}

		onClose()
	}

	const handleRemove = () => {
		if (!editor) return

		editor.chain().focus().extendMarkRange('link').unsetLink().run()
		onClose()
	}

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className={cn('sm:max-w-md bg-white', className)}>
				<DialogHeader>
					<DialogTitle>{initialUrl ? 'Edit Link' : 'Insert Link'}</DialogTitle>
					<DialogDescription>
						Set the URL and optional display text for your link.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<div className="space-y-4">
						<FormField
							control={form.control}
							name="url"
							render={({ field }) => (
								<FormItem>
									<FormLabel>URL</FormLabel>
									<FormControl>
										<Input
											placeholder="https://example.com"
											autoFocus
											{...field}
											className="bg-white border-green-600"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="text"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Display text (optional)</FormLabel>
									<FormControl>
										<Input
											placeholder="Link text"
											{...field}
											className="bg-white border-green-600"
										/>
									</FormControl>
									<p className="text-xs text-muted-foreground">
										If left empty and no text is selected, the URL will be used
										as the link text.
									</p>
								</FormItem>
							)}
						/>

						<DialogFooter className="gap-2 sm:gap-0">
							{initialUrl && (
								<Button
									type="button"
									variant="outline"
									onClick={handleRemove}
									className="mr-auto flex items-center gap-2 gradient-border-btn bg-white"
								>
									Remove Link
								</Button>
							)}
							<Button type="button" variant="ghost" onClick={onClose}>
								Cancel
							</Button>
							<Button
								type="button"
								onClick={form.handleSubmit(onSubmit)}
								className="flex items-center gap-2 gradient-btn text-white"
							>
								Save Link
							</Button>
						</DialogFooter>
					</div>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
