'use client'

import { useFormContext } from 'react-hook-form'
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/base/form'
import { Input } from '~/components/base/input'
import { ImageUpload } from '~/components/sections/projects/create/image-upload'
import { SocialLinks } from '~/components/sections/projects/create/social-links'
import type { CreateProjectFormData } from '~/lib/types/project/create-project.types'

export function LinksAndMediaFields() {
	const form = useFormContext<CreateProjectFormData>()

	return (
		<>
			<FormField
				control={form.control}
				name="website"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Website (optional)</FormLabel>
						<FormControl>
							<Input
								type="url"
								placeholder="https://yourproject.com"
								className="bg-white border-green-600"
								value={field.value ?? ''}
								onChange={(e) => field.onChange(e.target.value)}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="socialLinks"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Social Links (optional)</FormLabel>
						<FormControl>
							<SocialLinks
								value={field.value ?? []}
								onChange={field.onChange}
								error={form.formState.errors.socialLinks?.message}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="image"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Project Image (optional)</FormLabel>
						<FormControl>
							<ImageUpload
								value={field.value}
								onChange={field.onChange}
								error={form.formState.errors.image?.message}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	)
}
