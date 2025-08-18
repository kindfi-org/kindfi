'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import clsx from 'clsx'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/base/avatar'
import { Button } from '~/components/base/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from '~/components/base/form'
import { Textarea } from '~/components/base/textarea'
import { getAvatarFallback } from '~/lib/utils'

interface CommentFormProps {
	userAvatar?: string
	userName?: string
	placeholder?: string
	buttonText?: string
	maxLength?: number
	onSubmit: (content: string) => void
	onCancel?: () => void
	isReply?: boolean
}

export function CommentForm({
	userAvatar = '/abstract-geometric-shapes.png',
	userName = 'You',
	placeholder = 'Add a comment...',
	buttonText = 'Submit',
	maxLength = 500,
	onSubmit,
	onCancel,
	isReply = false,
}: CommentFormProps) {
	const [isFocused, setIsFocused] = useState(false)

	// Define the form schema with zod
	const commentFormSchema = z.object({
		content: z
			.string()
			.min(1, 'Comment cannot be empty')
			.max(maxLength, `Comment must be ${maxLength} characters or less`),
	})

	// Set up react-hook-form with zod validation
	const form = useForm<z.infer<typeof commentFormSchema>>({
		resolver: zodResolver(commentFormSchema),
		defaultValues: {
			content: '',
		},
	})

	const characterCount = form.watch('content').length
	const isOverLimit = characterCount > maxLength

	const handleFormSubmit = (data: z.infer<typeof commentFormSchema>) => {
		onSubmit(data.content)
		form.reset()
		setIsFocused(false)
	}

	return (
		<div
			className={clsx({
				'pl-6 border-l-2 border-gray-200 mt-3': isReply,
			})}
		>
			<div className="flex gap-3">
				<Avatar className="h-8 w-8 flex-shrink-0">
					<AvatarImage
						src={userAvatar || '/images/placeholder.png'}
						alt={userName}
					/>
					<AvatarFallback>{getAvatarFallback(userName)}</AvatarFallback>
				</Avatar>
				<div className="flex-1">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(handleFormSubmit)}>
							<FormField
								control={form.control}
								name="content"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Textarea
												{...field}
												placeholder={placeholder}
												className={clsx(
													'resize-none min-h-[80px] border-green-600',
													{
														'border-red-500 focus-visible:ring-red-500':
															isOverLimit,
													},
												)}
												onFocus={() => setIsFocused(true)}
												aria-label={placeholder}
												aria-invalid={isOverLimit}
												aria-describedby="character-count"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="flex justify-between items-center mt-2">
								<div
									id="character-count"
									className={clsx('text-xs', {
										'text-red-500': isOverLimit,
										'text-gray-500': !isOverLimit,
									})}
									aria-live="polite"
								>
									{characterCount}/{maxLength} characters
								</div>

								{isFocused && (
									<div className="flex gap-2">
										{onCancel && (
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="text-muted-foreground border border-muted-foreground"
												onClick={() => {
													form.reset()
													setIsFocused(false)
													onCancel()
												}}
												aria-label="Cancel"
											>
												Cancel
											</Button>
										)}
										<Button
											type="submit"
											size="sm"
											className="gradient-btn text-white"
											disabled={!form.formState.isValid || isOverLimit}
											aria-label={buttonText}
										>
											{buttonText}
										</Button>
									</div>
								)}
							</div>
						</form>
					</Form>
				</div>
			</div>
		</div>
	)
}
