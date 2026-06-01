'use client'

import Image from 'next/image'

export function FoundationDetailHero({
	coverImageUrl,
}: {
	coverImageUrl: string | null
}) {
	return (
		<div className="relative">
			{coverImageUrl ? (
				<div className="relative h-64 md:h-96 w-full overflow-hidden rounded-2xl">
					<Image
						src={coverImageUrl}
						alt=""
						fill
						className="object-cover"
						priority
						sizes="100vw"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
				</div>
			) : (
				<div className="relative h-64 md:h-96 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600">
					<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
				</div>
			)}
		</div>
	)
}
