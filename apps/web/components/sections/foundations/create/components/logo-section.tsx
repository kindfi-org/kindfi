'use client'

import { Image as ImageIcon } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/base/form'
import { ImageUpload } from '~/components/sections/projects/create/image-upload'
import type { CreateFoundationFormData } from '../types'
import { FormSectionHeader } from './form-section-header'

export function LogoSection() {
	const form = useFormContext<CreateFoundationFormData>()

	return (
		<div className="space-y-6">
			<FormSectionHeader icon={ImageIcon} title="Foundation Logo" optional />

			<FormField
				control={form.control}
				name="logo"
				render={({ field }) => (
					<FormItem>
						<FormLabel className="text-base font-medium">Upload Logo</FormLabel>
						<FormControl>
							<ImageUpload
								value={field.value ?? null}
								onChange={field.onChange}
								error={form.formState.errors.logo?.message}
							/>
						</FormControl>
						<FormDescription>
							Upload your foundation logo. Recommended: Square image, at least
							400×400px. This will be displayed prominently on your foundation
							profile.
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	)
}
