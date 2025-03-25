/**
 * @description      : UpdateCard
 * @author           : pheobeayo
 * @group            : ODHack12 contributor
 * @created          : 25/03/2025 - 10:36:35
 *
 * MODIFICATION LOG
 * - Version         : 1.0.0
 * - Date            : 25/03/2025
 * - Author          : pheobeayo
 * - Modification    : fixed the update tab section in the Project Details
 **/
'use client'

import Link from 'next/link'

import { ChevronDown, Heart, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import { Avatar, AvatarImage } from '~/components/base/avatar'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { Card, CardContent } from '~/components/base/card'
import type { UpdateItem } from '~/lib/types/project/update-tab-section.types'

interface UpdateCardProps {
	data: UpdateItem[]
	updatesUrl: string
}

export function UpdateCard({ data, updatesUrl }: UpdateCardProps) {
	const [isExpanded, setIsExpanded] = useState(false)
	return (
		<div className="space-y-6 mt-10">
			<div className="flex justify-between items-center">
				<h2 className="text-3xl font-bold">Updates</h2>
				<Link href={updatesUrl}>
					<Button className="text-xl font-bold">{data.length} updates</Button>
				</Link>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{data.map((update) => (
					<Card key={update.id} className="overflow-hidden border-gray-200">
						<CardContent className="p-4 sm:p-6">
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-4">
									{update.isFeatured && (
										<Badge
											variant="secondary"
											className="bg-blue-100 text-blue-700 font-bold hover:bg-blue-200"
										>
											Featured
										</Badge>
									)}
									<div className="flex items-center gap-2">
										<Button
											size="icon"
											className="flex items-center gap-1 text-gray-600"
											aria-label={`Like this update (${update.likes} likes)`}
										>
											<Heart className="h-5 w-5" />
											<span>{update.likes}</span>
										</Button>
										<Button
											size="icon"
											className="flex items-center gap-1 text-gray-600"
											aria-label={`View comments (${update.comments} comments)`}
										>
											<MessageSquare className="h-5 w-5" />
											<span>{update.comments}</span>
										</Button>
									</div>
								</div>
								<Button
									size="icon"
									className="text-gray-500 hover:text-gray-700"
									onClick={() => setIsExpanded(!isExpanded)}
									aria-label="Toggle additional options"
									aria-expanded={isExpanded}
								>
									<ChevronDown className="h-5 w-5" />
								</Button>
							</div>
							{isExpanded && (
								<div className="absolute right-6 top-16 z-10 p-3 bg-white shadow-md rounded-md border border-gray-200">
									<h4 className="font-semibold mb-2">Additional options</h4>
									<Button variant="outline" className="mr-2">
										Share
									</Button>
									<Button variant="outline">Save</Button>
								</div>
							)}

							<h3 className="text-2xl font-bold mb-4">{update.title}</h3>

							<div className="flex items-center gap-3 my-4">
								<Avatar>
									<AvatarImage
										src={update.author.avatar}
										alt={update.author.name}
									/>
								</Avatar>
								<div>
									<p className="font-medium">{update.author.name}</p>
									<p className="text-sm text-gray-500">{update.date}</p>
								</div>
							</div>
							<p className="text-gray-700 leading-relaxed mb-6">
								{update.description ||
									'No description available for this update.'}
							</p>
							<Link href={update.readMoreUrl}>
								<Button variant="outline" className="w-full">
									Read more
								</Button>
							</Link>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	)
}
