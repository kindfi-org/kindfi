'use client'

import { Flag } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import { cn } from '~/lib/utils'
import { getAlpha2FromAlpha3 } from '~/lib/utils/create-project-helpers'

interface CountryFlagProps {
	countryCode: string
	className?: string
}

export function CountryFlag({
	countryCode,
	className = 'w-6',
}: CountryFlagProps) {
	const alpha2 = getAlpha2FromAlpha3(countryCode)
	const [error, setError] = useState(false)

	if (!alpha2 || error) {
		return (
			<div
				className={cn(
					className,
					'aspect-[3/2] flex items-center justify-center mr-2 flex-shrink-0',
				)}
			>
				<Flag className="h-3 w-3 text-muted-foreground" />
			</div>
		)
	}

	return (
		<div
			className={cn(
				className,
				'aspect-[3/2] mr-2 flex-shrink-0 overflow-hidden relative',
			)}
		>
			<Image
				src={`https://flagcdn.com/${alpha2.toLowerCase()}.svg`}
				alt={`${countryCode} flag`}
				fill
				className="object-cover"
				onError={() => setError(true)}
				unoptimized
			/>
		</div>
	)
}
