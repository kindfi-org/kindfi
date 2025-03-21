'use client'

import { ChevronDown, Heart, MessageSquare } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/base/avatar'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { Card, CardContent } from '~/components/base/card'

interface FeaturedUpdate {
	title: string
	imageUrl: string
	imageAlt: string
	overlayTitle: string
	overlaySubtitle: string
	author: {
		name: string
		avatar: string
		initials: string
	}
	date: string
	likes: number
	comments: number
	updatesUrl: string
	readMoreUrl: string
}

const featuredUpdate: FeaturedUpdate = {
	title: 'Professionals Vote Qnetic #1 Investment Opportunity',
	imageUrl: '/images/image.png',
	imageAlt: 'Qnetic investment opportunity',
	overlaySubtitle: 'The',
	overlayTitle: "Judges' Choice Award Winner",
	author: {
		name: 'Joyce Zhou',
		avatar: '/avatar.svg',
		initials: 'JZ',
	},
	date: 'Mar 19',
	likes: 7,
	comments: 2,
	updatesUrl: '/updates',
	readMoreUrl: '/updates/professionals-vote-qnetic',
}

export function FeaturedUpdate() {
	const [expanded, setExpanded] = useState(false)

	return (
		<div className="space-y-6 mt-10">
			<div className="flex justify-between items-center">
				<h2 className="text-3xl font-bold tracking-tight">Featured Update</h2>
				<Link href={featuredUpdate.updatesUrl}>
					<Button>View all updates</Button>
				</Link>
			</div>

			<Card className="overflow-hidden border-gray-200">
				<CardContent className="p-4 sm:p-6">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-4">
							<Badge
								variant="secondary"
								className="bg-blue-100 text-blue-700 font-bold hover:bg-blue-200"
							>
								Featured
							</Badge>
							<div className="flex items-center gap-2">
								<Button
									size="icon"
									className="flex items-center gap-1 text-gray-600"
								>
									<Heart className="h-5 w-5" />
									<span>{featuredUpdate.likes}</span>
								</Button>
								<Button
									size="icon"
									className="flex items-center gap-1 text-gray-600"
								>
									<MessageSquare className="h-5 w-5" />
									<span>{featuredUpdate.comments}</span>
								</Button>
							</div>
						</div>
						<Button
							size="icon"
							onClick={() => setExpanded(!expanded)}
							className="text-gray-500 hover:text-gray-700"
						>
							<ChevronDown className="h-5 w-5" />
						</Button>
					</div>

					<h3 className="text-2xl font-bold mb-4">{featuredUpdate.title}</h3>

					<div className="relative w-full h-[300px] sm:h-[400px] rounded-md overflow-hidden">
						<Image
							src={featuredUpdate.imageUrl || '/images/image.png'}
							alt={featuredUpdate.imageAlt}
							fill
							className="object-cover"
						/>

						<div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 opacity-75" />

						{(featuredUpdate.overlayTitle ||
							featuredUpdate.overlaySubtitle) && (
							<div className="absolute bottom-0 left-0 right-0 p-6 text-white">
								{featuredUpdate.overlaySubtitle && (
									<p className="text-white/80 mb-1">
										{featuredUpdate.overlaySubtitle}
									</p>
								)}
								{featuredUpdate.overlayTitle && (
									<h4 className="text-2xl font-bold">
										{featuredUpdate.overlayTitle}
									</h4>
								)}
							</div>
						)}
					</div>

					<div className="flex items-center gap-3 my-4">
						<Avatar>
							<AvatarImage
								src={featuredUpdate.author.avatar}
								alt={featuredUpdate.author.name}
							/>
							<AvatarFallback>{featuredUpdate.author.initials}</AvatarFallback>
						</Avatar>
						<div>
							<p className="font-medium">{featuredUpdate.author.name}</p>
							<p className="text-sm text-gray-500">{featuredUpdate.date}</p>
						</div>
					</div>

					<Link href={featuredUpdate.readMoreUrl}>
						<Button variant="outline" className="w-full">
							Read more
						</Button>
					</Link>
				</CardContent>
			</Card>
		</div>
	)
}
