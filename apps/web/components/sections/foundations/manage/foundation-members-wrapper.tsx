'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { motion, useReducedMotion } from 'framer-motion'
import { Building2, Crown } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { IoPeopleOutline } from 'react-icons/io5'
import { Badge } from '~/components/base/badge'
import { Card, CardContent } from '~/components/base/card'
import { getFoundationBySlug } from '~/lib/queries/foundations/get-foundation-by-slug'
import { ManagePageShell, ManageSectionHeader } from './shared'

interface FoundationMembersWrapperProps {
	foundationSlug: string
}

export function FoundationMembersWrapper({
	foundationSlug,
}: FoundationMembersWrapperProps) {
	const prefersReducedMotion = useReducedMotion()
	const {
		data: foundation,
		error,
		isLoading,
	} = useSupabaseQuery(
		'foundation',
		(client) => getFoundationBySlug(client, foundationSlug),
		{ additionalKeyValues: [foundationSlug] },
	)

	if (error ?? !foundation) {
		notFound()
	}

	if (isLoading) {
		return (
			<ManagePageShell>
				<div className="space-y-6">
					<div className="h-12 bg-muted animate-pulse rounded-lg w-1/2" />
					<p className="text-muted-foreground" aria-live="polite">
						Loading…
					</p>
					<div className="h-48 bg-muted animate-pulse rounded-lg" />
				</div>
			</ManagePageShell>
		)
	}

	return (
		<ManagePageShell>
			<ManageSectionHeader
				icon={
					<IoPeopleOutline
						size={24}
						className="relative z-10"
						aria-hidden="true"
					/>
				}
				title="Foundation Team"
				description={`View the people behind ${foundation.name}`}
			/>

			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{
					delay: prefersReducedMotion ? 0 : 0.2,
					duration: prefersReducedMotion ? 0 : 0.3,
					transitionProperty: 'opacity',
				}}
				className="space-y-6"
			>
				<div>
					<h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
						<Crown className="h-6 w-6 text-purple-600" aria-hidden="true" />
						Founder
					</h2>
					{foundation.founder ? (
						<Card className="border-0 shadow-lg hover:shadow-xl transition-[box-shadow]">
							<CardContent className="p-6">
								<div className="flex items-start gap-6">
									{foundation.founder.imageUrl ? (
										<Link
											href={
												foundation.founder.slug
													? `/u/${foundation.founder.slug}`
													: '#'
											}
											className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full ring-4 ring-purple-100 hover:ring-purple-200 transition-[box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
										>
											<Image
												src={foundation.founder.imageUrl}
												alt={foundation.founder.displayName ?? 'Founder'}
												fill
												className="object-cover"
												sizes="96px"
											/>
										</Link>
									) : (
										<div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex-shrink-0 ring-4 ring-purple-100" />
									)}
									<div className="flex-1 min-w-0">
										<div className="flex items-start justify-between gap-4 mb-2">
											<div className="min-w-0 flex-1">
												{foundation.founder.slug ? (
													<Link
														href={`/u/${foundation.founder.slug}`}
														className="text-2xl font-bold hover:text-purple-600 transition-colors block mb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1 rounded"
													>
														{foundation.founder.displayName ?? 'Anonymous'}
													</Link>
												) : (
													<p className="text-2xl font-bold mb-1">
														{foundation.founder.displayName ?? 'Anonymous'}
													</p>
												)}
												<Badge className="bg-purple-600 text-white border-0 mt-2">
													Founder
												</Badge>
											</div>
										</div>
										{foundation.founder.bio ? (
											<p className="text-muted-foreground leading-relaxed mt-3">
												{foundation.founder.bio}
											</p>
										) : null}
									</div>
								</div>
							</CardContent>
						</Card>
					) : (
						<Card className="border-0 bg-muted/50">
							<CardContent className="py-12 text-center">
								<Building2
									className="h-16 w-16 text-muted-foreground mx-auto mb-4"
									aria-hidden="true"
								/>
								<p className="text-muted-foreground">
									Founder information not available
								</p>
							</CardContent>
						</Card>
					)}
				</div>

				<div className="mt-8">
					<Card className="border-0 bg-muted/30">
						<CardContent className="p-8 text-center">
							<IoPeopleOutline
								className="h-12 w-12 text-muted-foreground mx-auto mb-4"
								aria-hidden="true"
							/>
							<h3 className="text-lg font-semibold mb-2">Team Members</h3>
							<p className="text-muted-foreground text-sm">
								Foundation team member management coming soon. For now, only the
								founder is displayed.
							</p>
						</CardContent>
					</Card>
				</div>
			</motion.div>
		</ManagePageShell>
	)
}
