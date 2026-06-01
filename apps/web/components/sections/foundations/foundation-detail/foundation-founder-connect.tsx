'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Globe } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '~/components/base/card'
import { getSocialIcon } from './get-social-icon'
import type { useFoundationDetail } from './use-foundation-detail'

type Foundation = NonNullable<
	ReturnType<typeof useFoundationDetail>['foundation']
>

export function FoundationFounderConnect({
	foundation,
	shouldReduceMotion,
}: {
	foundation: Foundation
	shouldReduceMotion: boolean | null
}) {
	const hasConnect =
		foundation.websiteUrl || Object.keys(foundation.socialLinks).length > 0

	if (!foundation.founder && !hasConnect) {
		return null
	}

	return (
		<div className="grid md:grid-cols-2 gap-6">
			{foundation.founder && (
				<motion.div
					initial={
						shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }
					}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: shouldReduceMotion ? 0 : 0.4 }}
				>
					<Card className="h-full">
						<CardContent className="p-6 md:p-8">
							<h2 className="text-2xl font-bold mb-6">Founder</h2>
							<div className="flex items-start gap-4">
								{foundation.founder.imageUrl ? (
									<Link
										href={
											foundation.founder.slug
												? `/u/${foundation.founder.slug}`
												: '#'
										}
										className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full ring-4 ring-purple-100 hover:ring-purple-200 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
									>
										<Image
											src={foundation.founder.imageUrl}
											alt=""
											fill
											className="object-cover"
											sizes="80px"
										/>
									</Link>
								) : (
									<div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex-shrink-0 ring-4 ring-purple-100" />
								)}
								<div className="flex-1 min-w-0">
									{foundation.founder.slug ? (
										<Link
											href={`/u/${foundation.founder.slug}`}
											className="text-xl font-bold hover:text-purple-600 transition-colors block mb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1 rounded"
										>
											{foundation.founder.displayName || 'Anonymous'}
										</Link>
									) : (
										<p className="text-xl font-bold mb-2">
											{foundation.founder.displayName || 'Anonymous'}
										</p>
									)}
									{foundation.founder.bio && (
										<p className="text-muted-foreground text-sm leading-relaxed">
											{foundation.founder.bio}
										</p>
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			)}

			{hasConnect && (
				<motion.div
					initial={
						shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }
					}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: shouldReduceMotion ? 0 : 0.5 }}
				>
					<Card className="h-full">
						<CardContent className="p-6 md:p-8">
							<h2 className="text-2xl font-bold mb-6">Connect</h2>
							<div className="flex flex-col gap-3">
								{foundation.websiteUrl && (
									<a
										href={foundation.websiteUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-3 p-3 rounded-lg border hover:bg-purple-50 hover:border-purple-200 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
									>
										<div className="p-2 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
											<Globe
												className="h-5 w-5 text-purple-600"
												aria-hidden="true"
											/>
										</div>
										<span className="font-medium flex-1">Visit Website</span>
										<ArrowRight
											className="h-4 w-4 text-muted-foreground group-hover:text-purple-600 group-hover:translate-x-1 transition-all"
											aria-hidden="true"
										/>
									</a>
								)}
								{Object.entries(foundation.socialLinks).map(
									([platform, url]) => {
										const Icon = getSocialIcon(platform)
										return (
											<a
												key={platform}
												href={url}
												target="_blank"
												rel="noopener noreferrer"
												className="flex items-center gap-3 p-3 rounded-lg border hover:bg-purple-50 hover:border-purple-200 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 capitalize"
											>
												<div className="p-2 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
													<Icon
														className="h-5 w-5 text-purple-600"
														aria-hidden="true"
													/>
												</div>
												<span className="font-medium flex-1">{platform}</span>
												<ArrowRight
													className="h-4 w-4 text-muted-foreground group-hover:text-purple-600 group-hover:translate-x-1 transition-all"
													aria-hidden="true"
												/>
											</a>
										)
									},
								)}
							</div>
						</CardContent>
					</Card>
				</motion.div>
			)}
		</div>
	)
}
