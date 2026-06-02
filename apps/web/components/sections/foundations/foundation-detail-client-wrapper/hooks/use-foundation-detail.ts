'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { useSession } from 'next-auth/react'
import { useMemo } from 'react'
import { getFoundationBySlug } from '~/lib/queries/foundations/get-foundation-by-slug'

export function useFoundationDetail(slug: string) {
	const {
		data: foundation,
		isLoading,
		error,
	} = useSupabaseQuery('foundation', (client) => getFoundationBySlug(client, slug), {
		additionalKeyValues: [slug],
	})

	const { data: session } = useSession()

	const yearFounded = useMemo(
		() => (foundation && foundation.foundedYear > 0 ? foundation.foundedYear : null),
		[foundation],
	)

	const formattedDonations = useMemo(
		() =>
			foundation
				? new Intl.NumberFormat('en-US', {
						style: 'currency',
						currency: 'USD',
						minimumFractionDigits: 0,
						maximumFractionDigits: 0,
					}).format(foundation.totalDonationsReceived)
				: '$0',
		[foundation],
	)

	const shareUrl = useMemo(
		() =>
			typeof window !== 'undefined'
				? window.location.href
				: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/foundations/${slug}`,
		[slug],
	)

	const campaignsWithSlug = useMemo(
		() =>
			foundation?.campaigns?.filter((c): c is typeof c & { slug: string } => Boolean(c.slug)) ?? [],
		[foundation?.campaigns],
	)

	const isFounder = Boolean(session?.user?.id) && session?.user?.id === foundation?.founderId

	return {
		foundation,
		isLoading,
		error,
		yearFounded,
		formattedDonations,
		shareUrl,
		campaignsWithSlug,
		isFounder,
	}
}
