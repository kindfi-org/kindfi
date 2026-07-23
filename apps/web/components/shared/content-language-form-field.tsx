'use client'

import { useFormContext } from 'react-hook-form'
import { ContentLanguageSelector } from '~/components/shared/content-language-selector'
import type { SupportedLocale } from '~/lib/schemas/locale.schemas'

type ContentLanguageFormFieldProps = {
	disabled?: boolean
}

export const ContentLanguageFormField = ({ disabled = false }: ContentLanguageFormFieldProps) => {
	const form = useFormContext<{ sourceLocale?: SupportedLocale }>()

	return (
		<ContentLanguageSelector
			value={form.watch('sourceLocale') ?? 'en'}
			onChange={(locale) =>
				form.setValue('sourceLocale', locale, { shouldDirty: true, shouldValidate: true })
			}
			disabled={disabled}
		/>
	)
}
