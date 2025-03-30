import { ImageIcon, Trash2 } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/base/form'
import { cn } from '~/lib/utils'
import type { formInputs } from '../team-members'

type ImageUploaderType = {
	form: UseFormReturn<formInputs>
	index: number
}

export function ImageUploader({ form, index }: ImageUploaderType) {
	const MAX_FILE_SIZE = 5 * 1024 * 1024
	const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpg', 'image/webp']

	const handleImageUpload = async (
		file: File,
		fieldName: `teamMembers.${number}.profileImage`,
	) => {
		if (!file) return

		if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
			toast.error('Invalid file type. Please upload a PNG, JPG or WebP image.')
			return
		}

		if (file.size > MAX_FILE_SIZE) {
			toast.error('File is too large. Maximum size is 5MB.')
			return
		}

		const reader = new FileReader()
		reader.onloadend = () => {
			form.setValue(fieldName, reader.result as string)
		}
		reader.readAsDataURL(file)
	}
	return (
		<div>
			<FormField
				control={form.control}
				name={`teamMembers.${index}.profileImage`}
				render={({ field }) => (
					<FormItem>
						<FormLabel>Profile Image</FormLabel>
						<FormControl>
							<div
								className={cn(
									'flex items-center gap-4',
									!field.value && 'flex-col md:flex-row',
								)}
							>
								{field.value ? (
									<div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-muted">
										<Image
											src={field.value || '/placeholder.svg'}
											alt="Profile preview"
											fill
											className="object-cover"
										/>
										<button
											type="button"
											className="absolute right-0 top-0 h-6 w-6 rounded-full bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
											onClick={() =>
												form.setValue(`teamMembers.${index}.profileImage`, '')
											}
										>
											<Trash2 className="h-3 w-3" />
										</button>
									</div>
								) : (
									<div className="flex w-full items-center justify-center">
										<label
											htmlFor={`profile-image-${index}`}
											className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 hover:border-primary/50 hover:bg-muted/50"
										>
											<div className="mb-2 rounded-full bg-primary/10 p-2">
												<ImageIcon className="h-6 w-6 text-primary" />
											</div>
											<div className="text-center">
												<span className="font-medium text-primary">
													Click to upload
												</span>{' '}
												or drag and drop
											</div>
											<p className="text-sm text-muted-foreground">
												PNG, JPG or WebP (MAX. 5MB)
											</p>
										</label>
										<input
											id={`profile-image-${index}`}
											type="file"
											accept={ACCEPTED_IMAGE_TYPES.join(',')}
											className="hidden"
											onChange={(e) => {
												const file = e.target.files?.[0]
												if (file)
													handleImageUpload(
														file,
														`teamMembers.${index}.profileImage`,
													)
											}}
										/>
									</div>
								)}
							</div>
						</FormControl>
						<FormMessage className="text-blue-500" />
					</FormItem>
				)}
			/>
		</div>
	)
}
