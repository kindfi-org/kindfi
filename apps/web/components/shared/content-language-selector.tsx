'use client'

import { Label } from '~/components/base/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'
import { useI18n } from '~/lib/i18n/context'
import type { SupportedLocale } from '~/lib/schemas/locale.schemas'

type ContentLanguageSelectorProps = {
	value: SupportedLocale
	onChange: (locale: SupportedLocale) => void
	disabled?: boolean
}

export const ContentLanguageSelector = ({
	value,
	onChange,
	disabled = false,
}: ContentLanguageSelectorProps) => {
	const { t } = useI18n()

	return (
		<div className="space-y-2">
			<Label htmlFor="content-language">{t('common.contentLanguage')}</Label>
			<Select
				value={value}
				onValueChange={(next) => onChange(next as SupportedLocale)}
				disabled={disabled}
			>
				<SelectTrigger id="content-language" className="w-full sm:w-64">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="en">{t('common.contentLanguageEn')}</SelectItem>
					<SelectItem value="es">{t('common.contentLanguageEs')}</SelectItem>
				</SelectContent>
			</Select>
			<p className="text-sm text-muted-foreground">{t('common.contentLanguageHelp')}</p>
		</div>
	)
}
