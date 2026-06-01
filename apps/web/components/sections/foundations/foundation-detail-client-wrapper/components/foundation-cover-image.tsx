import Image from 'next/image'
import type { getFoundationBySlug } from '~/lib/queries/foundations/get-foundation-by-slug'

type Foundation = NonNullable<Awaited<ReturnType<typeof getFoundationBySlug>>>

interface FoundationCoverImageProps {
	foundation: Foundation
}

export function FoundationCoverImage({ foundation }: FoundationCoverImageProps) {
	if (foundation.coverImageUrl) {
		return (
			<div className="relative h-64 w-full overflow-hidden rounded-2xl border border-border md:h-96">
				<Image
					src={foundation.coverImageUrl}
					alt=""
					fill
					className="object-cover"
					priority
					sizes="(max-width: 1152px) 100vw, 72rem"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
			</div>
		)
	}

	return (
		<div className="relative h-64 w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/25 via-muted to-primary/10 md:h-96">
			<div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
		</div>
	)
}
