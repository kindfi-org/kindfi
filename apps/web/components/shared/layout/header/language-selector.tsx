'use client'

import { Button } from '~/components/base/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '~/components/base/dropdown-menu'
import type { Language } from '~/lib/i18n/context'
import { useI18n } from '~/lib/i18n/context'

const flagIcons = {
	en: '🇺🇸',
	es: '🇪🇸',
}

const languageNames = {
	en: 'English',
	es: 'Español',
}

export function LanguageSelector() {
	const { language, setLanguage, t } = useI18n()

	const handleLanguageChange = (lang: Language) => {
		setLanguage(lang)
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					aria-label={t('language.select')}
					className="relative h-8 w-8 rounded-full p-0 hover:bg-accent"
				>
					<span className="text-xl" role="img" aria-label={languageNames[language]}>
						{flagIcons[language]}
					</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-40">
				<DropdownMenuItem
					onClick={() => handleLanguageChange('en')}
					className={`cursor-pointer ${language === 'en' ? 'bg-accent' : ''}`}
				>
					<span className="mr-2 text-lg" role="img" aria-label="USA flag">
						🇺🇸
					</span>
					<span>{t('language.english')}</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => handleLanguageChange('es')}
					className={`cursor-pointer ${language === 'es' ? 'bg-accent' : ''}`}
				>
					<span className="mr-2 text-lg" role="img" aria-label="Spain flag">
						🇪🇸
					</span>
					<span>{t('language.spanish')}</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

