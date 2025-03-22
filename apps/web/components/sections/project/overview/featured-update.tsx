import { ChevronDown, Heart, MessageSquare } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { Avatar, AvatarFallback, AvatarImage } from '~/components/base/avatar'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { Card, CardContent } from '~/components/base/card'
import type { HighlightedUpdate } from '~/lib/types/project/overview-section.types'

interface FeaturedUpdateProps {
	data: HighlightedUpdate
}

export function FeaturedUpdate({ data }: FeaturedUpdateProps) {
	return (
		<div className="space-y-6 mt-10">
			<div className="flex justify-between items-center">
				<h2 className="text-3xl font-bold">Featured Update</h2>
				<Link href={data.updatesUrl}>
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
									<span>{data.likes}</span>
								</Button>
								<Button
									size="icon"
									className="flex items-center gap-1 text-gray-600"
								>
									<MessageSquare className="h-5 w-5" />
									<span>{data.comments}</span>
								</Button>
							</div>
						</div>
						<Button size="icon" className="text-gray-500 hover:text-gray-700">
							<ChevronDown className="h-5 w-5" />
						</Button>
					</div>

					<h3 className="text-2xl font-bold mb-4">{data.title}</h3>

					<div className="relative w-full h-[300px] sm:h-[400px] rounded-md overflow-hidden">
						<Image
							src={data.imageUrl || '/images/image.png'}
							alt={data.imageAlt}
							fill
							className="object-cover"
						/>

						<div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 opacity-75" />

						{(data.overlayTitle || data.overlaySubtitle) && (
							<div className="absolute bottom-0 left-0 right-0 p-6 text-white">
								{data.overlaySubtitle && (
									<p className="text-white/80 mb-1">{data.overlaySubtitle}</p>
								)}
								{data.overlayTitle && (
									<h4 className="text-2xl font-bold">{data.overlayTitle}</h4>
								)}
							</div>
						)}
					</div>

					<div className="flex items-center gap-3 my-4">
						<Avatar>
							<AvatarImage src={data.author.avatar} alt={data.author.name} />
							<AvatarFallback>{data.author.initials}</AvatarFallback>
						</Avatar>
						<div>
							<p className="font-medium">{data.author.name}</p>
							<p className="text-sm text-gray-500">{data.date}</p>
						</div>
					</div>

					<Link href={data.readMoreUrl}>
						<Button variant="outline" className="w-full">
							Read more
						</Button>
					</Link>
				</CardContent>
			</Card>
		</div>
	)
}
