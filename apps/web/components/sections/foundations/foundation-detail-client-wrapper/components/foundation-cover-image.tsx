import Image from 'next/image'
import type { getFoundationBySlug } from '~/lib/queries/foundations/get-foundation-by-slug'

type Foundation = NonNullable<Awaited<ReturnType<typeof getFoundationBySlug>>>

interface FoundationCoverImageProps {
	foundation: Foundation
}

export function FoundationCoverImage({ foundation }: FoundationCoverImageProps) {
	if (foundation.coverImageUrl) {
		return (
			<div className="relative h-64 w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm md:h-96">
				<Image
					src={foundation.coverImageUrl}
					alt=""
					fill
					className="object-cover"
					priority
					sizes="(max-width: 1152px) 100vw, 72rem"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent" />
			</div>
		)
	}

	return (
		<div className="relative h-64 w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-emerald-50 via-slate-50 to-indigo-50 shadow-sm md:h-96">
			<div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />
		</div>
	)
}
