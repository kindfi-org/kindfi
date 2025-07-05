'use client'

import { Flag } from 'lucide-react'

import { countries } from '~/lib/constants/projects/country.constant'

interface CountryFlagProps {
	countryCode: string
	className?: string
}

export function CountryFlag({
	countryCode,
	className = 'w-6 h-4',
}: CountryFlagProps) {
	// Find the country by alpha3 code
	const country = Object.values(countries).find((c) => c.alpha3 === countryCode)
	const alpha2Code = country?.alpha2

	if (!alpha2Code) {
		return (
			<div
				className={`${className} bg-gray-200 rounded-sm flex items-center justify-center mr-2 flex-shrink-0`}
			>
				<Flag className="h-3 w-3 text-muted-foreground" />
			</div>
		)
	}

	return (
		<div className={`${className} mr-2 flex-shrink-0 overflow-hidden`}>
			<img
				src={`https://flagcdn.com/${alpha2Code.toLowerCase()}.svg`}
				alt={`${countryCode} flag`}
				className="w-full h-full object-cover"
				onError={(e) => {
					// Fallback to generic flag icon if image fails to load
					const target = e.target as HTMLImageElement
					target.style.display = 'none'
					const fallback = target.nextElementSibling as HTMLElement
					if (fallback) {
						fallback.style.display = 'flex'
					}
				}}
			/>
			<div className="w-full h-full hidden items-center justify-center">
				<Flag className="h-3 w-3 text-muted-foreground" />
			</div>
		</div>
	)
}
